import { range, sleep } from 'chyme';
import { DownloadScrapFrom, ReadFileScrapFrom, ScrapFrom } from './types';
import { readFileSync, writeFileSync } from 'node:fs';

export async function handleFrom(from: ScrapFrom, option?: { savePath?: string }) {
	switch (from.type) {
		case 'download':
			return await ruleDownload(from, option);
		case 'read-file':
			return await ruleReadFile(from);
	}
}

export async function ruleDownload(from: DownloadScrapFrom, option?: { savePath?: string }) {
	const res = [];

	for (const { page, isLast } of getPages(from)) {
		let content;
		let failure;
		try {
			content = await fetch(page, {
				redirect: 'follow',
				// follow: 1,
				headers: {
					// Host: "www.programme-tv.net",
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
					Accept:
						'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
					'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
					'Accept-Encoding': 'gzip, deflate, br'
				}
			});
		} catch (e) {
			failure = e;
		}

		let str = '';

		if (content) {
			switch (from.format) {
				case 'html':
					str = await content.text();
					break;
				case 'xml':
					str = await content.text();
					break;
			}

			if (option?.savePath) {
				writeFile(option.savePath, page, str);
			}
		}

		if (from.wait && !isLast) {
			await sleep(from.wait);
		}

		res.push({
			page,
			content: str,
			failure
		});
	}

	return res;
}

export async function ruleReadFile(from: ReadFileScrapFrom) {
	const res = [];

	for (const { page } of getPages(from)) {
		const content = readFileSync(page);

		let str = '';
		switch (from.format) {
			case 'html':
				str = content.toString();
				break;
		}

		res.push({
			page,
			content: str,
			failure: undefined
		});
	}

	return res;
}

function getPages(from: DownloadScrapFrom | ReadFileScrapFrom) {
	const pages =
		from.xtype === 'array' ? from.pages : range(from.fromIndex, from.toIndex).map(from.page);
	return pages.map((page, index) => ({ page, index, isLast: index === pages.length - 1 }));
}

function pageToPath(page: string) {
	return page.replace(/( |\.|\/|\\|:|\?|&)/g, '-').replace(/-+/g, '-');
}

function writeFile(path: string, page: string, content: string) {
	writeFileSync(path + pageToPath(page) + '.html', content);
}
