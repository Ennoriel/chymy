import { describe, expect, it } from 'vitest';
import { parse } from '../../src';
import { html } from './data';

describe('html', () => {
	it('html-query-selector & html-text - defined', async () => {
		const value = html;
		const result = 'Hello world!';
		expect(
			await parse(value).parseToHtml().htmlQuerySelector('html body p').htmlText()
		).toStrictEqual(result);
	});

	it('html-query-selector & html-text - undefined', async () => {
		const value = html;
		const result = undefined;
		expect(
			await parse(value)
				.parseToHtml()
				.htmlQuerySelector('html body p ul')
				.htmlQuerySelector('li')
				.htmlQuerySelectorAll('li')
				.htmlText()
		).toStrictEqual(result);
	});

	it('html-query-selector-all & html-attribute', async () => {
		const value = html;
		const result = ['raspberry', 'blackcurrant', 'gooseberry'];
		expect(
			await parse(value)
				.parseToHtml()
				.htmlQuerySelectorAll('html body ul li')
				.iterate((li) => li.htmlAttribute('title'))
		).toStrictEqual(result);
	});
});
