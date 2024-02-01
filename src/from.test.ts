import { readFileSync } from 'node:fs';
import chyme from 'chyme';
import { handleFrom, ruleDownload, ruleReadFile } from './from';
import { ReadFileScrapFrom } from './types';
import { scrapRule } from '../test/config';

jest.mock('chyme');

const mockYNews = readFileSync('./test/https-news-ycombinator-com-p-1.html').toString();

global.fetch = jest.fn(() =>
	Promise.resolve({
		text: () => Promise.resolve(mockYNews)
	})
) as jest.Mock;

describe('from', () => {
	it(ruleDownload.name, async () => {
		const sleep = chyme.sleep as jest.MockedFunction<typeof chyme.sleep>;
		sleep.mockResolvedValue(Promise.resolve());

		const files = await handleFrom(scrapRule.from);
		expect(files.length).toStrictEqual(2);
		expect(files[0]?.page).toStrictEqual(1);
		expect(files[0]?.content).toStrictEqual(mockYNews);
	});

	it(ruleReadFile.name, async () => {
		const from: ReadFileScrapFrom = {
			type: 'read-file',
			path: (p) => `./test/https-news-ycombinator-com-p-${p}.html`,
			fromIndex: 1,
			toIndex: 1,
			format: 'html'
		};

		const files = await handleFrom(from);
		expect(files.length).toStrictEqual(1);
		expect(files[0]?.page).toStrictEqual(1);
		expect(files[0]?.content).toStrictEqual(mockYNews);
	});
});
