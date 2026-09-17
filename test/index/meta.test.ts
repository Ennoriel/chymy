import { describe, expect, it } from 'vitest';
import { parse } from '../../src';

describe('meta', () => {
	it('iterate', async () => {
		const value = [1, 2, 3];
		const result = [2, 4, 6];
		expect(await parse(value).iterate((item) => item.project((v) => v * 2))).toStrictEqual(result);
	});

	it('iterate - recursive with initial value', async () => {
		const value = [
			{ name: 'John', children: ['Maria', 'Jose'] },
			{ name: 'Edouard', children: ['Eleonora', 'Gregoria'] }
		];
		const result = [
			[
				{
					name: 'Maria',
					parent: 'John'
				},
				{
					name: 'Jose',
					parent: 'John'
				}
			],
			[
				{
					name: 'Eleonora',
					parent: 'Edouard'
				},
				{
					name: 'Gregoria',
					parent: 'Edouard'
				}
			]
		];
		expect(
			await parse(value).iterate(
				(person) =>
					person
						.project((v) => v.children)
						.iterate((child, root) => child.project((v) => ({ name: v, parent: root.name }))),
				{ rebaseRoot: true }
			)
		).toStrictEqual(result);
	});

	it('sequence', async () => {
		const value = 42;
		const result = 'Hello 84';
		expect(
			await parse(value)
				.project((v) => v * 2)
				.project((v) => `Hello ${v}`)
		).toStrictEqual(result);
	});

	it('sequence - keepInitialValues', async () => {
		const value = { name: 'John', age: 42 };
		const result = { name: 'John', age: 42, greeting: 'Hello JOHN!' };
		expect(
			await parse(value)
				.project((v) => ({ capitalized: v.name.toLocaleUpperCase() }))
				.project((v) => ({ greeting: `Hello ${v.capitalized}!` }))
				.mergeWithInput()
		).toStrictEqual(result);
	});

	it('sequence - use initial object', async () => {
		const value = { name: 'John', age: 42 };
		const result = { name: 'John', age: 42, greeting: 'Hello JOHN! You are 42 years old!' };
		expect(
			await parse(value)
				.project((v) => ({ capitalized: v.name.toLocaleUpperCase() }))
				.project((v, root) => ({
					greeting: `Hello ${v.capitalized}! You are ${root.age} years old!`
				}))
				.mergeWithInput()
		).toStrictEqual(result);
	});

	it('record', async () => {
		const value = 42;
		const result = { one: 84, two: 'Hello 42' };
		expect(
			await parse(value).record({
				one: (v) => v.project((x) => x * 2),
				two: (v) => v.project((x) => `Hello ${x}`)
			})
		).toStrictEqual(result);
	});

	it('record - with an object', async () => {
		const value = { name: 'John', age: 42 };
		const result = { name: 'John', age: 42, one: 84, two: 'Hello John' };
		expect(
			await parse(value).record({
				one: (v) => v.project((x) => x.age * 2),
				two: (v) => v.project((x) => `Hello ${x.name}`)
			})
		).toStrictEqual(result);
	});

	it('first-non-null first element non null', async () => {
		const value = { name: 'John', age: 42 };
		const result = 'John';
		expect(await parse(value).firstNonNull([(v) => v.project((x) => x.name)])).toStrictEqual(
			result
		);
	});

	it('first-non-null last element non null', async () => {
		const value = { name: 'John', age: 42 };
		const result = 'John';
		expect(
			await parse(value).firstNonNull([
				(v) => v.project((x: any) => x.notDefined),
				(v) => v.project((x) => x.name)
			])
		).toStrictEqual(result);
	});

	it('first-non-null no element defined', async () => {
		const value = { name: 'John', age: 42 };
		const result = undefined;
		expect(
			await parse(value).firstNonNull([
				(v) => v.project((x: any) => x.notDefined),
				(v) => v.project((x: any) => x.notDefinedEither)
			])
		).toStrictEqual(result);
	});
});
