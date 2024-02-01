import { sleep } from 'chyme';
import { DownloadScrapFrom, ReadFileScrapFrom, ScrapFrom } from './types';
import { readFileSync } from 'node:fs';

export async function handleFrom(from: ScrapFrom) {
	switch (from.type) {
		case 'download':
			return await ruleDownload(from);
		case 'read-file':
			return await ruleReadFile(from);
	}
}

export async function ruleDownload(from: DownloadScrapFrom) {
	const res = [];

	for (let page = from.fromIndex; page <= from.toIndex; page++) {
		const url = from.url(page);

		const content = await fetch(url);

		let str = '';
		switch (from.format) {
			case 'html':
				str = await content.text();
				break;
		}

		if (from.wait && page !== from.toIndex) {
			await sleep(from.wait);
		}

		res.push({
			page,
			content: str
		});
	}

	return res;
}

export async function ruleReadFile(from: ReadFileScrapFrom) {
	const res = [];

	for (let page = from.fromIndex; page <= from.toIndex; page++) {
		const path = from.path(page);

		const content = readFileSync(path);

		let str = '';
		switch (from.format) {
			case 'html':
				str = content.toString();
				break;
		}

		res.push({
			page,
			content: str
		});
	}

	return res;
}
