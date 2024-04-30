import { writeFileSync } from 'fs';
import { handleFrom, handleProcess } from '../../src';
import { scrapRule } from './medias.config';

function convertErrorToPlainObject<T extends {}>(e: any) {
	var obj = e;
	const res = {} as T;
	while (obj && obj !== Object.prototype) {
		Object.getOwnPropertyNames(obj).forEach((name) => {
			(res as any)[name] =
				typeof obj[name] === 'object' ? convertErrorToPlainObject(obj[name]) : obj[name];
		});
		obj = Object.getPrototypeOf(obj);
	}
	return res;
}

describe('medias', () => {
	it('download + process', async () => {
		const files = await handleFrom(scrapRule.from, {
			savePath: './test/medias/download/homepage/'
		});
		const filesSuccess = files.filter((file) => file.content && !file.failure);
		const res = handleProcess(filesSuccess, scrapRule.process);

		writeFileSync('./test/medias/res.json', JSON.stringify(res, null, 2));
	}, 600000);

	it('test', () => {
		const a = new Error('a');
		// console.log(a)

		const b = new Error('b', { cause: a });
		// console.log(convertErrorToPlainObject(b), null, 2);
		// console.log(JSON.stringify(convertErrorToPlainObject(b), null, 2));
	});
});
