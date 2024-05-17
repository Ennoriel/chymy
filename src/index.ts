import { readFileSync, writeFileSync } from 'node:fs';
import { HTMLElement, parse as htmlParse } from 'node-html-parser';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser();

// action rules
export type ReadDownload = {
	method: 'download';
	url: MaybeMethod<string>;
};

export type ReadFileRule = {
	method: 'read-file';
	path: MaybeMethod<string>;
};

export type WriteFileRule = {
	method: 'write-file';
	path: MaybeMethod<string>;
};

export type LogRule = {
	method: 'log';
};

// Response rules
export type ResponseDecodeRule = {
	method: 'response-decode';
	encoding?: MaybeMethod<string | undefined>;
};

// HTML rules
export type HtmlQuerySelectorRule = {
	method: 'html-query-selector';
	selector: MaybeMethod<string>;
};

export type HtmlQuerySelectorAllRule = {
	method: 'html-query-selector-all';
	selector: MaybeMethod<string>;
};

export type HtmlTextRule = {
	method: 'html-text';
};

export type HtmlAttributesRule = {
	method: 'html-attribute';
	attribute: MaybeMethod<string>;
};

// string rules
export type RegExpRule = {
	method: 'regexp';
	regexp: RegExp;
};

export type ParseIntRule = {
	method: 'parseInt';
};

export type DateRule = {
	method: 'date';
};

export type ParseToHtmlRule = {
	method: 'parse-to-html';
};

export type ParseAsXmlRule = {
	method: 'parse-as-xml';
};

export type ParseAsJsonRule = {
	method: 'parse-as-json';
};

// object rules
export type IdentityRule = {
	method: 'identity';
};

export type DefaultRule = {
	method: 'default';
	default: any;
};

export type ProjectRule = {
	method: 'project';
	project: (value: any, _value?: any) => any;
};

export type DeletePropertyRule = {
	method: 'delete-property';
	property: string;
};

// meta rules
export type IterateRule = {
	method: 'iterate';
	iterate: Rule;
	setCurrentItemAsInitialValue?: boolean;
};

export type SequenceRule = {
	method: 'sequence';
	sequence: Array<Rule>;
	keepInitialValue?: boolean; // necessary when the following step discards the current item
};

export type RecordRule = {
	method: 'record';
	record: Record<string, Rule>;
	discardPreviousSteps?: boolean;
};

export type Rule =
	| ReadDownload
	| ReadFileRule
	| WriteFileRule
	| LogRule
	| ResponseDecodeRule
	| HtmlQuerySelectorRule
	| HtmlQuerySelectorAllRule
	| HtmlTextRule
	| HtmlAttributesRule
	| RegExpRule
	| ParseIntRule
	| DateRule
	| ParseToHtmlRule
	| ParseAsXmlRule
	| ParseAsJsonRule
	| IdentityRule
	| DefaultRule
	| ProjectRule
	| DeletePropertyRule
	| IterateRule
	| SequenceRule
	| RecordRule;

type MaybeMethod<T> = T | ((value: any, _value: any) => T);

async function handleDownload(url: string) {
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
		log('download failure', e);
	}

	return undefined;
}

async function handleSequence(
	value: any,
	rules: Array<Rule>,
	_value: any,
	keepInitialValue?: boolean
) {
	let res: any = value;
	for (let rule of rules) {
		res = await _parse(rule, res, _value);
	}
	log('sequence', res);
	return keepInitialValue ? { ...value, ...res } : res;
}

async function handleRecord(
	value: any,
	rules: Record<string, Rule>,
	_value: any,
	discardPreviousSteps?: boolean
) {
	const res = {
		...(discardPreviousSteps || ensureIsPrimitive(value) ? {} : value),
		...Object.fromEntries(
			await Promise.all(
				Object.entries(rules).map(async ([key, rule]) => [key, await _parse(rule, value, _value)])
			)
		)
	};
	log('record', res);
	return res;
}

export function decodeArrayBuffer(buffer: ArrayBuffer, encoding: string | undefined) {
	const decoder = new TextDecoder(encoding ?? 'utf-8');
	return decoder.decode(buffer);
}

async function _parse(rule: Rule, value: any, _value: any) {
	let res: any;
	switch (rule.method) {
		// action rules
		case 'download':
			res = await handleDownload(normalizeMaybeMethod(rule.url, value, _value));
			break;
		case 'read-file':
			res = readFileSync(normalizeMaybeMethod(rule.path, value, _value)).toString();
			break;
		case 'write-file':
			writeFileSync(normalizeMaybeMethod(rule.path, value, _value), value);
			res = value;
			break;
		case 'log':
			res = value;
			console.log({ value, rule });
			break;

		// Response rules
		case 'response-decode':
			res = (value as Response)
				?.arrayBuffer()
				.then((buffer) =>
					decodeArrayBuffer(buffer, normalizeMaybeMethod(rule.encoding, value, _value))
				);
			break;

		// HTML rules
		case 'html-query-selector':
			res = (value as HTMLElement)?.querySelector(
				normalizeMaybeMethod(rule.selector, value, _value)
			);
			break;
		case 'html-query-selector-all':
			res = (value as HTMLElement)?.querySelectorAll(
				normalizeMaybeMethod(rule.selector, value, _value)
			);
			break;
		case 'html-text':
			res = (value as HTMLElement)?.text?.trim();
			break;
		case 'html-attribute':
			res = (value as HTMLElement)?.getAttribute(
				normalizeMaybeMethod(rule.attribute, value, _value)
			);
			break;

		// string rules
		case 'regexp':
			res = value?.match(rule.regexp)?.[0];
			break;
		case 'parseInt':
			res = parseInt(value);
			break;
		case 'date':
			res = new Date(value);
			break;
		case 'parse-to-html':
			res = htmlParse(value);
			break;
		case 'parse-as-xml':
			res = xmlParser.parse(value);
			break;
		case 'parse-as-json':
			res = JSON.parse(value);
			break;

		// object rules
		case 'identity':
			res = value;
			break;
		case 'default':
			res = value ?? rule.default;
			break;
		case 'project':
			res = rule.project(value, _value);
			break;
		case 'delete-property':
			delete value[rule.property];
			res = value;
			break;

		// meta rules
		case 'iterate':
			res = await Promise.all(
				value.map((v: any) =>
					_parse(rule.iterate, v, rule.setCurrentItemAsInitialValue ? v : _value)
				)
			);
			break;
		case 'sequence':
			res = await handleSequence(value, rule.sequence, _value, rule.keepInitialValue);
			break;
		case 'record':
			res = await handleRecord(value, rule.record, _value, rule.discardPreviousSteps);
			break;
	}
	return res;
}

export async function parse(rule: Rule, value: any = undefined) {
	return _parse(rule, value, value);
}

function normalizeMaybeMethod<T>(maybeMethod: MaybeMethod<T>, value: any, _value: any) {
	return typeof maybeMethod === 'function' ? (maybeMethod as Function)(value, _value) : maybeMethod;
}

type Primitive = null | undefined | boolean | number | bigint | string | symbol;

function ensureIsPrimitive(value: any): value is Primitive {
	return (
		value === null ||
		['undefined', 'boolean', 'number', 'bigint', 'string', 'symbol'].includes(typeof value)
	);
}

function log(text: string, value: any) {
	if (1 > 1) console.log(text, value);
}
