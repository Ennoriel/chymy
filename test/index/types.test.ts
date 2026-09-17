import { describe, expectTypeOf, it } from 'vitest';
import { parse } from '../../src';

// These assertions run through `tsc --noEmit`, not at runtime: expectTypeOf
// only performs compile-time checks and is a no-op when actually executed.
describe('type-level: record', () => {
	it('merges fields with the input by default', () => {
		const result = parse({ name: 'John', age: 42 }).record({
			greeting: (v) => v.project((x) => `Hello ${x.name}`)
		});
		// `record` without discardPreviousSteps returns an intersection type
		// (`RecordMergeBase<T> & RecordShape<T, F>`), so use `.branded` to compare
		// it against the flattened object shape below.
		expectTypeOf(result).resolves.branded.toEqualTypeOf<{
			name: string;
			age: number;
			greeting: string;
		}>();
	});

	it('discards the input shape when discardPreviousSteps is a literal true', () => {
		const result = parse({ name: 'John', age: 42 }).record(
			{ greeting: (v) => v.project((x) => `Hello ${x.name}`) },
			{ discardPreviousSteps: true }
		);
		expectTypeOf(result).resolves.toEqualTypeOf<{ greeting: string }>();
	});
});

describe('type-level: iterate', () => {
	it('maps the item type to the branch return type', () => {
		const result = parse([1, 2, 3]).iterate((item) => item.project((v) => v.toString()));
		expectTypeOf(result).resolves.toEqualTypeOf<string[]>();
	});

	it('unwraps a returned Chain instead of the Chain type itself', () => {
		const result = parse([1, 2, 3]).iterate((item) =>
			item.record({ doubled: (v) => v.project((x) => x * 2) })
		);
		expectTypeOf(result).resolves.toEqualTypeOf<{ doubled: number }[]>();
	});
});

describe('type-level: mergeWithInput', () => {
	it('unions the seed type with the current value type', () => {
		const result = parse({ name: 'John' })
			.project((v) => ({ greeting: `Hello ${v.name}` }))
			.mergeWithInput();
		// mergeWithInput returns the intersection `S & T`; use `.branded` here too.
		expectTypeOf(result).resolves.branded.toEqualTypeOf<{ name: string; greeting: string }>();
	});
});
