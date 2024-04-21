import { ProcessConfigArray, Scrap } from 'src';
import { medias } from './medias.data';

const config = [
	{
		name: 'title',
		from: 'html',
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
		name: 'rss_fromLink',
		from: 'html',
		rules: [
			{
				method: 'querySelector',
				selector: () =>
					`head > link[rel="alternate"][type="application/rss+xml"], head > link[rel="alternate"][type="application/atom+xml"]`
			},
			{
				method: 'attributes',
				selector: 'href'
			}
		]
	},
	{
		name: 'rss_fromA',
		from: 'html',
		rules: [
			{
				method: 'querySelector',
				selector: () => `a[href*="rss"], a[title*="rss"]`
			},
			{
				method: 'attributes',
				selector: 'href'
			}
		]
	},
	{
		name: '',
		from: 'object',
		rules: [
			{
				method: 'project',
				selector: (object: { title?: string; rss_fromLink?: string; rss_fromA?: string }) => ({
					...object,
					rss_fromLink:
						object.rss_fromLink && object.rss_fromLink.startsWith('/')
							? object.rss_fromLink
							: object.rss_fromLink
				})
			}
		]
	}
] satisfies ProcessConfigArray;

export const scrapRule = {
	name: 'rss',

	from: {
		type: 'download',
		xtype: 'array',
		pages: medias
			.filter((_, index) => index >= 0 && index < 15)
			.map((media) => `https://${media.site.toLocaleLowerCase()}`),
		format: 'html'
	},

	process: {
		type: 'scrap',
		fromIndex: 0,
		toIndex: 0,
		config
	}
} satisfies Scrap;
