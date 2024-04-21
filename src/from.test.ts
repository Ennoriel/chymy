import { readFileSync } from 'node:fs';
import { sleep } from 'chyme';
import { handleFrom, ruleDownload, ruleReadFile } from './from';
import { ReadFileScrapFrom } from './types';
import { scrapRule } from '../test/config';

type Mock_chyme_sleep = jest.MockedFunction<typeof sleep>;

jest.mock('chyme', () => {
	return {
		...jest.requireActual('chyme'),
		sleep: jest.fn()
	};
});

const mockYNews = readFileSync('./test/https-news-ycombinator-com-p-1.html').toString();

global.fetch = jest.fn(() =>
	Promise.resolve({
		text: () => Promise.resolve(mockYNews)
	})
) as jest.Mock;

describe('from', () => {
	it(ruleDownload.name, async () => {
		(sleep as Mock_chyme_sleep).mockResolvedValue(Promise.resolve());

		const files = await handleFrom(scrapRule.from);
		expect(files.length).toStrictEqual(2);
		expect(files[0]?.page).toStrictEqual('https://news.ycombinator.com/?p=1');
		expect(files[0]?.content).toStrictEqual(mockYNews);
	});

	it(ruleReadFile.name + 'index', async () => {
		const from: ReadFileScrapFrom = {
			type: 'read-file',
			xtype: 'index',
			page: (p) => `./test/https-news-ycombinator-com-p-${p}.html`,
			fromIndex: 1,
			toIndex: 1,
			format: 'html'
		};

		const files = await handleFrom(from);
		expect(files.length).toStrictEqual(1);
		expect(files[0]?.page).toStrictEqual('./test/https-news-ycombinator-com-p-1.html');
		expect(files[0]?.content).toStrictEqual(mockYNews);
	});

	it(ruleReadFile.name + 'pages', async () => {
		const from: ReadFileScrapFrom = {
			type: 'read-file',
			xtype: 'array',
			pages: [`./test/https-news-ycombinator-com-p-1.html`],
			format: 'html'
		};

		const files = await handleFrom(from);
		expect(files.length).toStrictEqual(1);
		expect(files[0]?.page).toStrictEqual('./test/https-news-ycombinator-com-p-1.html');
		expect(files[0]?.content).toStrictEqual(mockYNews);
	});
});
