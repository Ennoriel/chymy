import { describe, expect, it, vi } from 'vitest';
import { mkdirSync } from 'node:fs';
import { decodeArrayBuffer, parse } from '../../src';
import { html } from './data';

const mockFetch = {
	clone: () => mockFetch,
	arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
};

vi.mock('node:fs', async (importOriginal) => ({
	...(await importOriginal<typeof import('node:fs')>()),
	mkdirSync: vi.fn().mockImplementation(() => ''),
	writeFileSync: vi.fn().mockImplementation(() => '')
}));

global.fetch = vi.fn(() => Promise.resolve(new Response(html)));

describe('action', () => {
	it('download - with encoding', async () => {
		const value = 'https://maximedupont.fr';
		const expected = html;
		expect(
			await parse(value)
				.download((v) => v)
				.responseDecode('utf-8')
		).toStrictEqual(expected);
	});

	it('download - no encoding', async () => {
		const value = 'http://localhost:5173';
		const expected = html;
		expect(
			await parse(value)
				.download((v) => v)
				.responseDecode()
		).toStrictEqual(expected);
	});

	it('download - encoding in response', async () => {
		const value = 'http://localhost:5173';
		const expected = html;

		const result = await parse(value)
			.record({ response: (v) => v.download((u) => u) })
			.record({
				raw_content: (v) => v.project((x) => x.response).responseDecode('utf-8')
			})
			.record({
				encoding: (v) => v.project((x) => x.raw_content).regexp(/(?<=encoding=").*(?=")/)
			})
			.record({
				content: (v) =>
					v.project(async (x) =>
						decodeArrayBuffer(await x.response!.clone().arrayBuffer(), x.encoding)
					)
			});

		expect(result.content).toStrictEqual(expected);
		expect(result.encoding).toStrictEqual('ISO-8859-1');
	});

	it('read-file', async () => {
		const value = undefined;
		const expected = 'Hello world!';
		expect(await parse(value).readFile('./test/static_file.txt')).toStrictEqual(expected);
	});

	it('write-file', async () => {
		const value = '12azert34';
		const expected = value;
		expect(await parse(value).writeFile('./test/index/action.txt')).toStrictEqual(expected);
	});

	it('write-file - creates missing folders', async () => {
		const value = '12azert34';
		await parse(value).writeFile('./test/tmp/nested/dir/action.txt');
		expect(mkdirSync).toHaveBeenCalledWith('./test/tmp/nested/dir', { recursive: true });
	});

	it('log', async () => {
		const value = '12azert34';
		const expected = value;
		expect(await parse(value).log()).toStrictEqual(expected);
	});
});
