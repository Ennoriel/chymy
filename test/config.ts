import type { ProcessConfigArray, Scrap } from '../src/types';

const config: ProcessConfigArray = [
	{
		name: 'id',
		from: 'html',
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
			}
		]
	},
	{
		name: 'rank',
		from: 'html',
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
		from: 'html',
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
		from: 'html',
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
		from: 'html',
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
		from: 'html',
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
		from: 'html',
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
		from: 'html',
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
		from: 'html',
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

export const scrapRule: Scrap = {
	name: 'y-combinator',

	from: {
		type: 'download',
		url: (p) => `https://news.ycombinator.com/?p=${p}`,
		fromIndex: 1,
		toIndex: 2,
		wait: 5000,
		format: 'html'
	},

	process: {
		type: 'scrap',
		fromIndex: 0,
		toIndex: 29,
		config
	}
};
