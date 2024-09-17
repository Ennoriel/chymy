import { Rule, parse } from '../../src';

describe('meta', () => {
	it('iterate', async () => {
		const config = {
			method: 'iterate',
			iterate: { method: 'project', project: (v) => v * 2 }
		} satisfies Rule;
		const value = [1, 2, 3];
		const result = [2, 4, 6];
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('iterate - recursive with initial value', async () => {
		const config = {
			method: 'iterate',
			setCurrentItemAsInitialValue: true,
			iterate: {
				method: 'sequence',
				sequence: [
					{ method: 'project', project: (v) => v.children },
					{
						method: 'iterate',
						iterate: {
							method: 'project',
							project: (v, _v) => ({ name: v, parent: _v.name })
						}
					}
				]
			}
		} satisfies Rule;
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
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('sequence', async () => {
		const config = {
			method: 'sequence',
			sequence: [
				{ method: 'project', project: (v) => v * 2 },
				{ method: 'project', project: (v) => `Hello ${v}` }
			]
		} satisfies Rule;
		const value = 42;
		const result = 'Hello 84';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('sequence - keepInitialValues', async () => {
		const config = {
			method: 'sequence',
			keepInitialValue: true,
			sequence: [
				{ method: 'project', project: (v) => ({ capitalized: v.name.toLocaleUpperCase() }) },
				{ method: 'project', project: (v) => ({ greeting: `Hello ${v.capitalized}!` }) }
			]
		} satisfies Rule;
		const value = { name: 'John', age: 42 };
		const result = { name: 'John', age: 42, greeting: 'Hello JOHN!' };
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('sequence - use initial object', async () => {
		const config = {
			method: 'sequence',
			keepInitialValue: true,
			sequence: [
				{ method: 'project', project: (v) => ({ capitalized: v.name.toLocaleUpperCase() }) },
				{
					method: 'project',
					project: (v, _v) => ({
						greeting: `Hello ${v.capitalized}! You are ${_v.age} years old!`
					})
				}
			]
		} satisfies Rule;
		const value = { name: 'John', age: 42 };
		const result = { name: 'John', age: 42, greeting: 'Hello JOHN! You are 42 years old!' };
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('record', async () => {
		const config = {
			method: 'record',
			record: {
				one: { method: 'project', project: (v) => v * 2 },
				two: { method: 'project', project: (v) => `Hello ${v}` }
			}
		} satisfies Rule;
		const value = 42;
		const result = { one: 84, two: 'Hello 42' };
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('record - with an object', async () => {
		const config = {
			method: 'record',
			record: {
				one: { method: 'project', project: (v) => v.age * 2 },
				two: { method: 'project', project: (v) => `Hello ${v.name}` }
			}
		} satisfies Rule;
		const value = { name: 'John', age: 42 };
		const result = { name: 'John', age: 42, one: 84, two: 'Hello John' };
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('first-non-null first element non null', async () => {
		const config = {
			method: 'first-non-null',
			rules: [{ method: 'project', project: (v) => v.name }]
		} satisfies Rule;
		const value = { name: 'John', age: 42 };
		const result = 'John';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('first-non-null last element non null', async () => {
		const config = {
			method: 'first-non-null',
			rules: [
				{ method: 'project', project: (v) => v.notDefined },
				{ method: 'project', project: (v) => v.name }
			]
		} satisfies Rule;
		const value = { name: 'John', age: 42 };
		const result = 'John';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('first-non-null no element defined', async () => {
		const config = {
			method: 'first-non-null',
			rules: [
				{ method: 'project', project: (v) => v.notDefined },
				{ method: 'project', project: (v) => v.notDefinedEither }
			]
		} satisfies Rule;
		const value = { name: 'John', age: 42 };
		const result = undefined;
		expect(await parse(config, value)).toStrictEqual(result);
	});
});
