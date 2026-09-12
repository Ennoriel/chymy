import { describe, it } from 'vitest';
import { writeFileSync } from 'fs';
import { parseMedias } from './media.config';
import { medias } from './media.data';

describe('medias', () => {
	it.skip('medias', async () => {
		const res = await parseMedias(medias);
		console.log(Object.keys(res[0]!));
		writeFileSync('./test/media/download.json', JSON.stringify(res, null, 2));
	});
});
