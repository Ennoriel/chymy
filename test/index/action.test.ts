import { readFileSync } from 'fs';
import { Rule, parse } from '../../src';
import { html } from './data';

/* @ts-ignore */
global.fetch = jest.fn(() =>
	Promise.resolve({
		text: () => Promise.resolve(html)
	})
);

jest.mock('node:fs', () => ({
	readFileSync,
	writeFileSync: jest.fn()
}));

describe('action', () => {
	it('download', async () => {
		const config = { method: 'download', url: (v) => v } satisfies Rule;
		const value = 'http://localhost:5173';
		const result = html;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('read-file', async () => {
		const config = { method: 'read-file', path: './test/static_file.txt' } satisfies Rule;
		const value = undefined;
		const result = 'Hello world!';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('write-file', async () => {
		const config = { method: 'write-file', path: './src/do_not_commit.txt' } satisfies Rule;
		const value = '12azert34';
		const result = value;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('log', async () => {
		const config = { method: 'log' } satisfies Rule;
		const value = '12azert34';
		const result = value;
		expect(await parse(config, value)).toStrictEqual(result);
	});
});
