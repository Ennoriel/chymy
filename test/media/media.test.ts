import { writeFileSync } from 'fs';
import { parse } from '../../src';
import { config } from './media.config';
import { medias } from './media.data';

describe('medias', () => {
	test.skip('medias', async () => {
		const res = await parse(config, medias);
		console.log(Object.keys(res[0]));
		writeFileSync('./test/media/download.json', JSON.stringify(res, null, 2));
	});
});
