import { describe, expect, it, vi } from 'vitest';
import { Rule, parse } from '../../src';
import { html } from './data';

const mockFetch = {
	clone: () => mockFetch,
	arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
};

vi.mock('node:fs', async (importOriginal) => ({
	...(await importOriginal<typeof import('node:fs')>()),
	writeFileSync: vi.fn().mockImplementation(() => '')
}));

global.fetch = vi.fn(() => Promise.resolve(new Response(html)));

describe('action', () => {
	it('download - with encoding', async () => {
		const config = {
			method: 'sequence',
			sequence: [
				{ method: 'download', url: (v) => v },
				{ method: 'response-decode', encoding: 'utf-8' }
			]
		} satisfies Rule;
		const value = 'https://maximedupont.fr';
		const expected = html;
		expect(await parse(config, value)).toStrictEqual(expected);
	});

	it('download - no encoding', async () => {
		const config = {
			method: 'sequence',
			sequence: [{ method: 'download', url: (v) => v }, { method: 'response-decode' }]
		} satisfies Rule;
		const value = 'http://localhost:5173';
		const expected = html;
		expect(await parse(config, value)).toStrictEqual(expected);
	});

	it('download - encoding in response', async () => {
		const config: Rule = {
			method: 'sequence',
			sequence: [
				{ method: 'record', record: { response: { method: 'download', url: (v) => v } } },
				{
					method: 'record',
					record: {
						raw_content: {
							method: 'sequence',
							sequence: [
								{ method: 'project', project: (value) => value.response },
								{ method: 'response-decode', encoding: 'utf-8' }
							]
						}
					}
				},
				{
					method: 'record',
					record: {
						encoding: {
							method: 'sequence',
							sequence: [
								{ method: 'project', project: (value) => value.raw_content },
								{ method: 'regexp', regexp: /(?<=encoding=").*(?=")/ }
							]
						}
					}
				},
				{
					method: 'record',
					record: {
						content: {
							method: 'response-decode',
							get: (v) => v.response,
							encoding: (v) => v.encoding
						}
					}
				}
			]
		};
		const value = 'http://localhost:5173';
		const expected = html;

		const result = await parse(config, value);
		expect(result.content).toStrictEqual(expected);
		expect(result.encoding).toStrictEqual('ISO-8859-1');
	});

	it('read-file', async () => {
		const config = { method: 'read-file', path: './test/static_file.txt' } satisfies Rule;
		const value = undefined;
		const expected = 'Hello world!';
		expect(await parse(config, value)).toStrictEqual(expected);
	});

	it('write-file', async () => {
		const config = { method: 'write-file', path: './test/index/action.txt' } satisfies Rule;
		const value = '12azert34';
		const expected = value;
		expect(await parse(config, value)).toStrictEqual(expected);
	});

	it('log', async () => {
		const config = { method: 'log' } satisfies Rule;
		const value = '12azert34';
		const expected = value;
		expect(await parse(config, value)).toStrictEqual(expected);
	});
});
