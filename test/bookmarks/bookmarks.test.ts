import { writeFileSync } from 'fs';
import { handleFrom, handleProcess } from '../../src';
import { scrapRule } from './bookmarks.config';

describe('bookmarks', () => {
	it('download + process', async () => {
		const files = await handleFrom(scrapRule.from, { savePath: './test/bookmarks/download/' });
		const filesSucceeded = files.filter((file) => file.content && !file.failure);
		const res = handleProcess(filesSucceeded, scrapRule.process);
		writeFileSync('./test/bookmarks/res.json', JSON.stringify(res, null, 2));

		const filesFailed = files.filter((file) => file.content && file.failure);
		writeFileSync('./test/bookmarks/failures.json', JSON.stringify(filesFailed, null, 2));
	}, 200000);
});

// [
//     "https://byteatati.me/",
//     "https://sci-hub.live/",
//     "https://www.math.utah.edu/~alfeld/math/polya.html",
//     "https://www.theonlytails.com/"
// ]
