import { Rule, parse } from '../../src';
import { html } from './data';

describe('html', () => {
	it('html-query-selector & html-text - defined', async () => {
		const config = {
			method: 'sequence',
			sequence: [
				{ method: 'parse-to-html' },
				{ method: 'html-query-selector', selector: 'html body p' },
				{ method: 'html-text' }
			]
		} satisfies Rule;
		const value = html;
		const result = 'Hello world!';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('html-query-selector & html-text - undefined', async () => {
		const config = {
			method: 'sequence',
			sequence: [
				{ method: 'parse-to-html' },
				{ method: 'html-query-selector', selector: 'html body p ul' },
				{ method: 'html-query-selector', selector: 'li' },
				{ method: 'html-query-selector-all', selector: 'li' },
				{ method: 'html-text' }
			]
		} satisfies Rule;
		const value = html;
		const result = undefined;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('html-query-selector-all & html-attribute', async () => {
		const config = {
			method: 'sequence',
			sequence: [
				{ method: 'parse-to-html' },
				{ method: 'html-query-selector-all', selector: 'html body ul li' },
				{ method: 'iterate', iterate: { method: 'html-attribute', attribute: 'title' } }
			]
		} satisfies Rule;
		const value = html;
		const result = ['raspberry', 'blackcurrant', 'gooseberry'];
		expect(await parse(config, value)).toStrictEqual(result);
	});
});
