import type { ProcessConfigArray } from '../src/types';

const config: ProcessConfigArray = [
	{
		name: 'preprocess',
		from: 'preprocess',
		method: "parseHtml"
	},
	{
		name: 'id',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) => `#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i})`,
				index: (i) => 3 * i + 1
			},
			{
				method: 'attributes',
				selector: 'id'
			},
			{
				method: 'parseInt'
			},
		]
	},
	{
		name: 'rank',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) => `#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td`,
				index: (i) => 3 * i + 1
			},
			{
				method: 'text'
			},
			{
				method: 'regexp',
				selector: /\d+/
			},
			{
				method: 'parseInt'
			}
		]
	},
	{
		name: 'title',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(3) > span > a`,
				index: (i) => 3 * i + 1
			},
			{
				method: 'text'
			}
		]
	},
	{
		name: 'link',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(3) > span > a`,
				index: (i) => 3 * i + 1
			},
			{
				method: 'attributes',
				selector: 'href'
			}
		]
	},
	{
		name: 'source',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(3) > span > span > a`,
				index: (i) => 3 * i + 1
			},
			{
				method: 'text'
			}
		]
	},
	{
		name: 'score',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(2) .score`,
				index: (i) => 3 * i + 2
			},
			{
				method: 'text'
			},
			{
				method: 'regexp',
				selector: /\d+/
			},
			{
				method: 'parseInt'
			},
			{
				method: 'default',
				selector: 0
			}
		]
	},
	{
		name: 'by',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(2) .hnuser`,
				index: (i) => 3 * i + 2
			},
			{
				method: 'text'
			}
		]
	},
	{
		name: 'date',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(2) .age`,
				index: (i) => 3 * i + 2
			},
			{
				method: 'attributes',
				selector: 'title'
			},
			{
				method: 'format',
				selector: (str) => `${str}Z`
			},
			{
				method: 'date'
			}
		]
	},
	{
		name: 'comments',
		from: 'attribute',
		rules: [
			{
				method: 'querySelector',
				selector: (i) =>
					`#hnmain > tr:nth-of-type(3) > td > table > tr:nth-of-type(${i}) > td:nth-of-type(2) > span > a:nth-of-type(3)`,
				index: (i) => 3 * i + 2
			},
			{
				method: 'text'
			},
			{
				method: 'regexp',
				selector: /\d+/
			},
			{
				method: 'parseInt'
			},
			{
				method: 'default',
				selector: 0
			}
		]
	},
	{
		name: '',
		from: 'object',
		rules: [
			{
				method: 'project',
				selector: (object: {
					id: number;
					rank: number;
					title: string;
					link: string;
					source?: string;
					score: number;
					by: string;
					date: Date;
					comments: number;
				}) => ({
					id: object.id,
					title: object.title,
					link: object.link,
					source: object.source,
					by: object.by,
					date: object.date,
					type: object.title.startsWith('Show HN')
						? 'show'
						: object.title.startsWith('Ask HN')
							? 'ask'
							: object.title.match(/\(YC [SW]\d\d\) is hiring/)
								? 'job'
								: 'story',
					stat: {
						newsId: object.id,
						rank: object.rank,
						score: object.score,
						comments: object.comments
					}
				})
			}
		]
	}
];

export const scrapRule = {
	from: {
		type: 'download' as const,
		xtype: 'index' as const,
		page: (p: number) => `https://news.ycombinator.com/?p=${p}`,
		fromIndex: 1,
		toIndex: 2,
		wait: 5000,
		format: 'html' as const
	},

	process: {
		type: 'scrap' as const,
		fromIndex: 0,
		toIndex: 29,
		config
	}
};
