import { describe, expect, it } from 'vitest';
import { parse } from '../../src';

describe('array', () => {
	it('sort - default comparator', async () => {
		const value = [3, 1, 2];
		const result = [1, 2, 3];
		expect(await parse(value).sort()).toStrictEqual(result);
	});

	it('sort - custom comparator', async () => {
		const value = [1, 2, 3];
		const result = [3, 2, 1];
		expect(await parse(value).sort((a, b) => b - a)).toStrictEqual(result);
	});

	it('sort - does not mutate the input array', async () => {
		const value = [3, 1, 2];
		await parse(value).sort();
		expect(value).toStrictEqual([3, 1, 2]);
	});

	it('sort - undefined', async () => {
		const value = undefined;
		const result = undefined;
		expect(await parse(value).sort()).toStrictEqual(result);
	});

	it('dedupe - primitives', async () => {
		const value = [1, 2, 2, 3, 1];
		const result = [1, 2, 3];
		expect(await parse(value).dedupe()).toStrictEqual(result);
	});

	it('dedupe - with a key accessor', async () => {
		const value = [
			{ id: 1, name: 'a' },
			{ id: 1, name: 'b' },
			{ id: 2, name: 'c' }
		];
		const result = [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'c' }
		];
		expect(await parse(value).dedupe((item) => item.id)).toStrictEqual(result);
	});

	it('dedupe - undefined', async () => {
		const value = undefined;
		const result = undefined;
		expect(await parse(value).dedupe()).toStrictEqual(result);
	});

	it('flat - default depth', async () => {
		const value = [[1, 2], [3], [4, 5]];
		const result = [1, 2, 3, 4, 5];
		expect(await parse(value).flat()).toStrictEqual(result);
	});

	it('flat - custom depth', async () => {
		const value = [[[1, 2]], [[3]]];
		const result = [1, 2, 3];
		expect(await parse(value).flat(2)).toStrictEqual(result);
	});

	it('flat - undefined', async () => {
		const value = undefined;
		const result = undefined;
		expect(await parse(value).flat()).toStrictEqual(result);
	});
});
