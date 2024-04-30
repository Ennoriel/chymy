import { ProcessConfigArray, Scrap } from 'src';
import { bookmarks } from './bookmarks.data';

const config = [
	{
		name: 'preprocess',
		from: 'preprocess',
		method: "parseHtml"
	},
	{
		name: 'title',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: () => `head > title`
			},
			{
				method: 'text'
			}
		]
	},
	{
		name: 'description',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: () => `head > meta[name="description"]`
			},
			{
				method: 'attributes',
				selector: 'content'
			}
		]
	},
	{
		name: 'description',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: () => `head > meta[property="og:description"]`
			},
			{
				method: 'attributes',
				selector: 'content'
			}
		]
	},
	{
		name: 'image',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: () => `head > meta[property="og:image"]`
			},
			{
				method: 'attributes',
				selector: 'content'
			}
		]
	},
	{
		name: 'language',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: () => `html`
			},
			{
				method: 'attributes',
				selector: 'lang'
			}
		]
	},
	{
		name: 'author',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: () => `head > meta[name="author"]`
			},
			{
				method: 'attributes',
				selector: 'content'
			}
		]
	}
] satisfies ProcessConfigArray;

export const scrapRule = {
	name: 'rss',

	from: {
		type: 'download',
		xtype: 'array',
		pages: bookmarks.filter((_, index) => index >= 0 && index < 999),
		format: 'html'
	},

	process: {
		type: 'scrap',
		fromIndex: 0,
		toIndex: 0,
		keepPage: true,
		config
	}
} satisfies Scrap;
