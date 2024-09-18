import { describe, expect, it } from 'vitest';
import { Rule, parse } from '../../src';

describe('object', () => {
	it('identity', async () => {
		const config = { method: 'identity' } satisfies Rule;
		const value = { hello: 'world!' };
		const result = value;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('default - with defined value', async () => {
		const config = { method: 'default', default: 'default string' } satisfies Rule;
		const value = { hello: 'world!' };
		const result = value;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('default - with undefined value', async () => {
		const config = { method: 'default', default: 'default string' } satisfies Rule;
		const value = undefined;
		const result = 'default string';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('project', async () => {
		const config = { method: 'project', project: (value) => value.hello } satisfies Rule;
		const value = { hello: 'world!' };
		const result = 'world!';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('delete-property', async () => {
		const config = { method: 'delete-property', property: 'hello' } satisfies Rule;
		const value = { hello: 'world!' };
		const result = {};
		expect(await parse(config, value)).toStrictEqual(result);
	});
});
