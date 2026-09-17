import { describe, expect, it } from 'vitest';
import { parse } from '../../src';
import { parsedXml, xml } from './data';

describe('string', () => {
	it('regexp - defined', async () => {
		const value = '12azert34';
		const result = 'azert';
		expect(await parse(value).regexp(/[a-z]+/)).toStrictEqual(result);
	});

	it('regexp - undefined', async () => {
		const value = undefined;
		const result = undefined;
		expect(await parse(value).regexp(/[a-z]+/)).toStrictEqual(result);
	});

	it('regexp - not found', async () => {
		const value = '1234';
		const result = undefined;
		expect(await parse(value).regexp(/[a-z]+/)).toStrictEqual(result);
	});

	it('parseInt', async () => {
		const value = '123';
		const result = 123;
		expect(await parse(value).parseInt()).toStrictEqual(result);
	});

	it('date', async () => {
		const value = '2024-05-01T08:42:26.558Z';
		const result = new Date(1714552946558);
		expect(await parse(value).date()).toStrictEqual(result);
	});

	it('clean', async () => {
		const value = 'Hello les    &#8239;haricots&#8239;   , qu&rsquo;ils sont &ldquo;beaux&rdquo;';
		const result = 'Hello les haricots , qu’ils sont “beaux”';
		expect(await parse(value).clean()).toStrictEqual(result);
	});

	it('parse-to-html', async () => {
		const value = '<html><body>Hello world!</body></html>';
		const result = 'Hello world!';
		expect(await parse(value).parseToHtml().htmlText()).toStrictEqual(result);
	});

	it('parse-as-xml', async () => {
		const value = xml;
		const result = parsedXml;
		expect(await parse(value).parseAsXml()).toStrictEqual(result);
	});

	it('parse-as-xml with get method', async () => {
		const value = { xml };
		const result = parsedXml;
		expect(
			await parse(value)
				.project((v) => v.xml)
				.parseAsXml()
		).toStrictEqual(result);
	});

	it('parse-as-json', async () => {
		const result = { hello: 'world!' };
		const value = JSON.stringify(result);
		expect(await parse(value).parseAsJson()).toStrictEqual(result);
	});
});
