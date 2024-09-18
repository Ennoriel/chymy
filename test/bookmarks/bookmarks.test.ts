import { describe, expect, it } from 'vitest';
import { Rule, parse } from '../../src';

const config: Rule = {
	method: 'sequence',
	sequence: [
		{
			method: 'record',
			record: {
				homepage: {
					method: 'sequence',
					sequence: [
						{
							method: 'read-file',
							path: (value) => `./test/bookmarks/${value}`
						},
						{
							method: 'parse-to-html'
						}
					]
				}
			}
		},
		{
			method: 'sequence',
			sequence: [
				{
					method: 'project',
					project: (value) => value.homepage
				},
				{
					method: 'record',
					discardPreviousSteps: true,
					record: {
						title: {
							method: 'sequence',
							sequence: [
								{
									method: 'html-query-selector',
									selector: 'head > title'
								},
								{
									method: 'html-text'
								}
							]
						},
						description: {
							method: 'sequence',
							sequence: [
								{
									method: 'html-query-selector',
									selector: `head > meta[name="description"]`
								},
								{
									method: 'html-attribute',
									attribute: 'content'
								}
							]
						},
						image: {
							method: 'sequence',
							sequence: [
								{
									method: 'html-query-selector',
									selector: `head > meta[property="og:image"]`
								},
								{
									method: 'html-attribute',
									attribute: 'content'
								}
							]
						},
						language: {
							method: 'sequence',
							sequence: [
								{
									method: 'html-query-selector',
									selector: `html`
								},
								{
									method: 'html-attribute',
									attribute: 'lang'
								}
							]
						}
					}
				}
			]
		}
	]
};

describe('bookmarks', () => {
	it('retrieve SEO data with https://a.singlediv.com/', async () => {
		const value = 'https-a-single-div-com.html';
		const result = {
			title: 'A Single Div',
			description: 'A CSS drawing experiment to see what’s possible with a single div.',
			image: undefined,
			language: 'en'
		};
		expect(await parse(config, value)).toStrictEqual(result);
	});
});
