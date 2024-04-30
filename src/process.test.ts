import { ParsedType } from './types';
import { handleProcess, parseRuleAttribute, parseRuleObject } from './process';
import { scrapRule } from '../test/config';
import { readFileSync } from 'node:fs';
import { yCombinatorProcessed } from '../test/https-news-ycombinator-com-p-1-processed';

const mockYNews = readFileSync('./test/https-news-ycombinator-com-p-1.html').toString();

describe('from', () => {
	it(parseRuleObject.name, async () => {
		expect(
			parseRuleObject({ a: 2 }, { method: 'project', selector: ({ a }) => ({ b: a }) })
		).toStrictEqual({ b: 2 });
	});

	it(parseRuleAttribute.name, async () => {
		expect(
			parseRuleAttribute('some value', { method: 'default', selector: 'default' }, 1)
		).toStrictEqual('some value');
		expect(parseRuleAttribute('', { method: 'default', selector: 'default' }, 1)).toStrictEqual('');
		expect(
			parseRuleAttribute(undefined, { method: 'default', selector: 'default' }, 1)
		).toStrictEqual('default');

		expect(parseRuleAttribute('1.', { method: 'regexp', selector: /\d+/ }, 1)).toStrictEqual('1');
		expect(parseRuleAttribute('.', { method: 'regexp', selector: /\d+/ }, 1)).toStrictEqual(
			undefined
		);

		expect(parseRuleAttribute('1', { method: 'parseInt' }, 1)).toStrictEqual(1);
		expect(parseRuleAttribute('not a number', { method: 'parseInt' }, 1)).toStrictEqual(undefined);

		expect(parseRuleAttribute('8/21/24', { method: 'date' }, 1)).toStrictEqual(new Date('8/21/24'));

		document.body.innerHTML =
			'<div id="test">' + '  <p>Hello 1</p>' + '  <p>Hello 2</p>' + '</div>';

		function makeSimpleElement(tag: string, content: string, id?: string) {
			const p = document.createElement(tag);
			p.innerText = content;
			p.innerHTML = content;

			if (id) p.id = id;
			if (id) p.setAttribute('_id', id);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(p as any).text = content;

			return p;
		}

		expect(
			parseRuleAttribute(
				document as unknown as ParsedType,
				{ method: 'querySelector', selector: (i) => `#test > p:nth-of-type(${i})` },
				1
			)
		).toStrictEqual(makeSimpleElement('p', 'Hello 1'));
		expect(
			parseRuleAttribute(
				document as unknown as ParsedType,
				{
					method: 'querySelector',
					selector: (i) => `#test > p:nth-of-type(${i})`,
					index: (i) => i + 1
				},
				1
			)
		).toStrictEqual(makeSimpleElement('p', 'Hello 2'));
		expect(
			parseRuleAttribute(
				document as unknown as ParsedType,
				{ method: 'querySelector', selector: () => `#test > p > p` },
				1
			)
		).toStrictEqual(undefined);

		expect(
			parseRuleAttribute(
				makeSimpleElement('p', 'Hello 1') as unknown as ParsedType,
				{ method: 'text' },
				1
			)
		).toStrictEqual('Hello 1');

		expect(
			parseRuleAttribute(
				makeSimpleElement('p', 'Hello 1', 'azer') as unknown as ParsedType,
				{ method: 'attributes', selector: '_id' },
				1
			)
		).toStrictEqual('azer');

		expect(
			parseRuleAttribute(
				makeSimpleElement('p', 'Hello 1', 'azer') as unknown as ParsedType,
				{ method: 'parseInt' },
				1
			)
		).toStrictEqual(undefined);
		expect(parseRuleAttribute('Hello', { method: 'text' }, 1)).toStrictEqual(undefined);
	});

	it(handleProcess.name, () => {
		const result = handleProcess([{ page: "1", content: mockYNews }], scrapRule.process);
		expect(result).toStrictEqual(yCombinatorProcessed);
	});
});
