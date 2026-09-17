import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { HTMLElement, parse as htmlParse } from 'node-html-parser';
import { xml2js, type ElementCompact as _ElementCompact } from 'xml-js';
import { sleep } from 'chyme';

export type ElementCompact = _ElementCompact;

type Accessor<T, Out> = (value: T, rootValue: any) => Out;
type MaybeAccessor<T, Out> = Out | Accessor<T, Out>;

type StepFn = (value: any, rootValue: any) => any;

type IterateOptions = {
	strategy?: 'parallel' | 'sequence';
	waitMs?: number;
	rebaseRoot?: boolean;
};

type RecordOptions = {
	discardPreviousSteps?: boolean;
};

type Primitive = null | undefined | boolean | number | bigint | string | symbol;

// Resolves what a branch callback (a record field, or a firstNonNull entry) produces
// once awaited: unwraps a returned Chain<O>, or awaits a plain value/Promise.
type BranchReturn<Fn> = Fn extends (base: any, rootValue: any) => infer R
	? R extends Chain<infer O, any>
		? O
		: Awaited<R>
	: never;

type RecordFields<T> = Record<string, (base: Chain<T>, rootValue: any) => any>;
type RecordShape<T, F extends RecordFields<T>> = { [K in keyof F]: BranchReturn<F[K]> };
type RecordMergeBase<T> = T extends Primitive ? unknown : T;

function ensureIsPrimitive(value: any): value is Primitive {
	return (
		value === null ||
		['undefined', 'boolean', 'number', 'bigint', 'string', 'symbol'].includes(typeof value)
	);
}

function resolveAccessor<T, Out>(
	maybeAccessor: MaybeAccessor<T, Out>,
	value: T,
	rootValue: any
): Out {
	return typeof maybeAccessor === 'function'
		? (maybeAccessor as Accessor<T, Out>)(value, rootValue)
		: maybeAccessor;
}

function htmlDecode(input: string | undefined) {
	if (!input) return undefined;
	const iteration1 = htmlParse(input).text;
	if (!iteration1) return undefined;
	const iteration2 = htmlParse(iteration1).text;
	return iteration2 ?? undefined;
}

function cleanString(str: string | undefined) {
	const step1 = str
		?.replace(/&#8239;/g, ' ')
		.replace(/\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	return htmlDecode(step1);
}

function debugLog(text: string, value: any) {
	// eslint-disable-next-line no-constant-condition
	if (1 > 1) console.log(text, value);
}

async function fetchUrl(url: string) {
	try {
		return await fetch(url, {
			redirect: 'follow',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
				Accept:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
				'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
				'Accept-Encoding': 'gzip, deflate, br'
			}
		});
	} catch (e) {
		debugLog('download failure', e);
	}

	return undefined;
}

export function decodeArrayBuffer(buffer: ArrayBuffer, encoding: string | undefined) {
	const decoder = new TextDecoder(encoding ?? 'utf-8');
	return decoder.decode(buffer);
}

// T is the value currently flowing through the chain; S is the value this chain's
// lineage started with (fixed at the nearest `Chain.of()`), used by `mergeWithInput`.
export class Chain<T = any, S = T> implements PromiseLike<T> {
	private readonly seed: any;
	private readonly rootValue: any;
	private readonly steps: ReadonlyArray<StepFn>;
	private runPromise?: Promise<any>;

	private constructor(seed: any, rootValue: any, steps: ReadonlyArray<StepFn> = []) {
		this.seed = seed;
		this.rootValue = rootValue;
		this.steps = steps;
	}

	static of<T = any>(seed?: T, rootValue: any = seed): Chain<T, T> {
		return new Chain<T, T>(seed, rootValue);
	}

	private addStep<Out>(step: StepFn): Chain<Out, S> {
		return new Chain<Out, S>(this.seed, this.rootValue, [...this.steps, step]);
	}

	private run(): Promise<T> {
		if (!this.runPromise) {
			this.runPromise = this.steps.reduce<Promise<any>>(
				(p, step) => p.then((value) => step(value, this.rootValue)),
				Promise.resolve(this.seed)
			);
		}
		return this.runPromise;
	}

	private static async resolveBranch<Out>(
		returned: Chain<Out, any> | Out | Promise<Out>
	): Promise<Out> {
		return returned instanceof Chain ? returned.run() : returned;
	}

	then<TResult1 = T, TResult2 = never>(
		onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
	): PromiseLike<TResult1 | TResult2> {
		return this.run().then(onfulfilled, onrejected);
	}

	// action
	download(url: MaybeAccessor<T, string>): Chain<Response | undefined, S> {
		return this.addStep((value, rootValue) => fetchUrl(resolveAccessor(url, value, rootValue)));
	}

	readFile(path: MaybeAccessor<T, string>): Chain<string, S> {
		return this.addStep((value, rootValue) =>
			readFileSync(resolveAccessor(path, value, rootValue)).toString()
		);
	}

	writeFile(path: MaybeAccessor<T, string>): Chain<T, S> {
		return this.addStep((value, rootValue) => {
			const resolvedPath = resolveAccessor(path, value, rootValue);
			mkdirSync(dirname(resolvedPath), { recursive: true });
			writeFileSync(resolvedPath, value);
			return value;
		});
	}

	log(get?: (value: T, rootValue: any) => unknown): Chain<T, S> {
		return this.addStep((value, rootValue) => {
			console.log({ value: get ? get(value, rootValue) : value });
			return value;
		});
	}

	// response
	responseDecode(encoding?: MaybeAccessor<T, string | undefined>): Chain<string | undefined, S> {
		return this.addStep(async (value: Response | undefined, rootValue) => {
			const buffer = await value?.clone()?.arrayBuffer();
			if (!buffer) return undefined;
			return decodeArrayBuffer(buffer, resolveAccessor(encoding, value as T, rootValue));
		});
	}

	// html
	htmlQuerySelector(selector: MaybeAccessor<T, string>): Chain<HTMLElement | null | undefined, S> {
		return this.addStep((value: HTMLElement | undefined, rootValue) =>
			value?.querySelector(resolveAccessor(selector, value as T, rootValue))
		);
	}

	htmlQuerySelectorAll(selector: MaybeAccessor<T, string>): Chain<HTMLElement[] | undefined, S> {
		return this.addStep((value: HTMLElement | undefined, rootValue) =>
			value?.querySelectorAll(resolveAccessor(selector, value as T, rootValue))
		);
	}

	htmlText(): Chain<string | undefined, S> {
		return this.addStep((value: HTMLElement | undefined) => value?.text?.trim());
	}

	htmlAttribute(attribute: MaybeAccessor<T, string>): Chain<string | undefined, S> {
		return this.addStep((value: HTMLElement | undefined, rootValue) =>
			value?.getAttribute(resolveAccessor(attribute, value as T, rootValue))
		);
	}

	// string
	regexp(pattern: RegExp): Chain<string | undefined, S> {
		return this.addStep((value: string | undefined) => value?.match(pattern)?.[0]);
	}

	parseInt(): Chain<number, S> {
		return this.addStep((value) => parseInt(value));
	}

	date(): Chain<Date, S> {
		return this.addStep((value) => new Date(value));
	}

	clean(): Chain<string | undefined, S> {
		return this.addStep((value: string | undefined) => cleanString(value));
	}

	parseToHtml(): Chain<HTMLElement, S> {
		return this.addStep((value: string) => htmlParse(value));
	}

	parseAsXml(): Chain<ElementCompact, S> {
		return this.addStep((value: string) => xml2js(value, { compact: true }));
	}

	parseAsJson(): Chain<any, S> {
		return this.addStep((value: string) => JSON.parse(value));
	}

	// object
	default<D>(fallback: D): Chain<Exclude<T, null | undefined> | D, S> {
		return this.addStep((value) => value ?? fallback);
	}

	project<Out>(fn: (value: T, rootValue: any) => Out): Chain<Out, S> {
		return this.addStep((value, rootValue) => fn(value, rootValue));
	}

	deleteProperty<K extends keyof T>(property: K): Chain<Omit<T, K>, S> {
		return this.addStep((value) => {
			delete value[property];
			return value;
		});
	}

	mergeWithInput(): Chain<S & T, S> {
		return this.addStep((value) => ({ ...this.seed, ...value }));
	}

	// array
	sort<Item>(
		this: Chain<Item[] | null | undefined, S>,
		compareFn?: (a: Item, b: Item) => number
	): Chain<Item[] | undefined, S> {
		return this.addStep((value: Item[] | null | undefined) => value?.slice().sort(compareFn));
	}

	dedupe<Item>(
		this: Chain<Item[] | null | undefined, S>,
		key?: (item: Item) => unknown
	): Chain<Item[] | undefined, S> {
		return this.addStep((value: Item[] | null | undefined) => {
			if (!value) return undefined;
			const seen = new Set<unknown>();
			return value.filter((item) => {
				const k = key ? key(item) : item;
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
		});
	}

	flat<Item, D extends number = 1>(
		this: Chain<Item[] | null | undefined, S>,
		depth?: D
	): Chain<FlatArray<Item[], D>[] | undefined, S> {
		return this.addStep((value: Item[] | null | undefined) => value?.flat(depth));
	}

	// meta
	iterate<Item, Out>(
		this: Chain<Item[] | null | undefined, S>,
		cb: (item: Chain<Item>, rootValue: any) => Chain<Out, any> | Out | Promise<Out>,
		options?: IterateOptions
	): Chain<Out[], S> {
		return this.addStep(async (value: Item[], rootValue: any) => {
			const runOne = async (item: Item) => {
				const itemRoot = options?.rebaseRoot ? item : rootValue;
				const sub = Chain.of<Item>(item, itemRoot);
				return Chain.resolveBranch(cb(sub, itemRoot));
			};

			if (options?.strategy === 'sequence') {
				const res: Out[] = [];
				for (const item of value) {
					res.push(await runOne(item));
					if (options.waitMs) await sleep(options.waitMs);
				}
				return res;
			}

			return Promise.all(value.map(runOne));
		});
	}

	// `discardPreviousSteps: true` must be passed as a literal at the call site for this
	// overload to be picked. TypeScript resolves overloads using the *declared* type of the
	// argument, so passing it through a variable (`const opts = { discardPreviousSteps: true }`)
	// widens `true` to `boolean` and silently falls through to the merge-with-input overload below.
	record<F extends RecordFields<T>>(
		fields: F,
		options: RecordOptions & { discardPreviousSteps: true }
	): Chain<RecordShape<T, F>, S>;
	record<F extends RecordFields<T>>(
		fields: F,
		options?: RecordOptions & { discardPreviousSteps?: false }
	): Chain<RecordMergeBase<T> & RecordShape<T, F>, S>;
	record(fields: RecordFields<T>, options?: RecordOptions): Chain<any, S> {
		return this.addStep(async (value: any, rootValue: any) => {
			const base = options?.discardPreviousSteps || ensureIsPrimitive(value) ? {} : value;
			const entries = await Promise.all(
				Object.entries(fields).map(async ([key, fn]) => {
					const sub = Chain.of(value, rootValue);
					return [key, await Chain.resolveBranch(fn(sub, rootValue))] as const;
				})
			);
			return { ...base, ...Object.fromEntries(entries) };
		});
	}

	firstNonNull<Bs extends ReadonlyArray<(base: Chain<T>, rootValue: any) => any>>(
		branches: Bs
	): Chain<BranchReturn<Bs[number]> | undefined, S> {
		return this.addStep(async (value: any, rootValue: any) => {
			let res: any;
			for (const branch of branches) {
				const sub = Chain.of(value, rootValue);
				res = await Chain.resolveBranch(branch(sub, rootValue));
				if (res) break;
			}
			return res;
		});
	}
}

export function parse<T = undefined>(value?: T): Chain<T, T> {
	return Chain.of(value, value);
}
