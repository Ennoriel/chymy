import { Rule, parse } from '../../src';
import { parsedXml, xml } from './data';

describe('string', () => {
	it('regexp - defined', async () => {
		const config = { method: 'regexp', regexp: /[a-z]+/ } satisfies Rule;
		const value = '12azert34';
		const result = 'azert';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('regexp - undefined', async () => {
		const config = { method: 'regexp', regexp: /[a-z]+/ } satisfies Rule;
		const value = undefined;
		const result = undefined;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('regexp - not found', async () => {
		const config = { method: 'regexp', regexp: /[a-z]+/ } satisfies Rule;
		const value = '1234';
		const result = undefined;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('parseInt', async () => {
		const config = { method: 'parseInt' } satisfies Rule;
		const value = '123';
		const result = 123;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('date', async () => {
		const config = { method: 'date' } satisfies Rule;
		const value = '2024-05-01T08:42:26.558Z';
		const result = new Date(1714552946558);
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('clean', async () => {
		const config = { method: 'clean' } satisfies Rule;
		const value = 'Hello les    &#8239;haricots&#8239;   , qu&rsquo;ils sont &ldquo;beaux&rdquo;';
		const result = 'Hello les haricots , qu’ils sont “beaux”';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('parse-to-html', async () => {
		const config = {
			method: 'sequence',
			sequence: [{ method: 'parse-to-html' }, { method: 'html-text' }]
		} satisfies Rule;
		const value = '<html><body>Hello world!</body></html>';
		const result = 'Hello world!';
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('parse-as-xml', async () => {
		const config = { method: 'parse-as-xml' } satisfies Rule;
		const value = xml;
		const result = parsedXml;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('parse-as-xml with get method', async () => {
		const config = { method: 'parse-as-xml', get: (v) => v.xml } satisfies Rule;
		const value = { xml };
		const result = parsedXml;
		expect(await parse(config, value)).toStrictEqual(result);
	});

	it('parse-as-json', async () => {
		const config = { method: 'parse-as-json' } satisfies Rule;
		const result = { hello: 'world!' };
		const value = JSON.stringify(result);
		expect(await parse(config, value)).toStrictEqual(result);
	});
});
