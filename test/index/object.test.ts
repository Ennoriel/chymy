import { describe, expect, it } from 'vitest';
import { parse } from '../../src';

describe('object', () => {
	it('identity', async () => {
		const value = { hello: 'world!' };
		const result = value;
		expect(await parse(value)).toStrictEqual(result);
	});

	it('default - with defined value', async () => {
		const value = { hello: 'world!' };
		const result = value;
		expect(await parse(value).default('default string')).toStrictEqual(result);
	});

	it('default - with undefined value', async () => {
		const value = undefined;
		const result = 'default string';
		expect(await parse(value).default(result)).toStrictEqual(result);
	});

	it('project', async () => {
		const value = { hello: 'world!' };
		const result = 'world!';
		expect(await parse(value).project((v) => v.hello)).toStrictEqual(result);
	});

	it('delete-property', async () => {
		const value = { hello: 'world!' };
		const result = {};
		expect(await parse(value).deleteProperty('hello')).toStrictEqual(result);
	});
});
