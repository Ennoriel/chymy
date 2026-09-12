import { describe, expect, it } from 'vitest';
import { parse } from '../../src';

describe('bookmarks', () => {
	it('retrieve SEO data with https://a.singlediv.com/', async () => {
		const value = 'https-a-single-div-com.html';
		const result = {
			title: 'A Single Div',
			description: 'A CSS drawing experiment to see what’s possible with a single div.',
			image: undefined,
			language: 'en'
		};

		const parsed = await parse(value)
			.record({
				homepage: (v) => v.readFile((x) => `./test/bookmarks/${x}`).parseToHtml()
			})
			.project((v) => v.homepage)
			.record(
				{
					title: (v) => v.htmlQuerySelector('head > title').htmlText(),
					description: (v) =>
						v.htmlQuerySelector('head > meta[name="description"]').htmlAttribute('content'),
					image: (v) =>
						v.htmlQuerySelector('head > meta[property="og:image"]').htmlAttribute('content'),
					language: (v) => v.htmlQuerySelector('html').htmlAttribute('lang')
				},
				{ discardPreviousSteps: true }
			);

		expect(parsed).toStrictEqual(result);
	});
});
