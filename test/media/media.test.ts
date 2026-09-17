import { describe, expect, it, vi } from 'vitest';
import { parseMedias } from './media.config';

const homepageHtml = `<html>
	<head>
		<title>Chymy Blog</title>
		<meta name="description" content="A blog about chymy" />
		<link rel="alternate" type="application/rss+xml" href="https://example.com/rss.xml" />
	</head>
	<body></body>
</html>`;

const rssContent = '<rss><channel><title>Chymy Blog Feed</title></channel></rss>';

global.fetch = vi.fn((input: RequestInfo | URL) =>
	Promise.resolve(
		new Response(String(input) === 'https://example.com/rss.xml' ? rssContent : homepageHtml)
	)
) as unknown as typeof fetch;

describe('medias', () => {
	it('medias', async () => {
		const medias = [{ name: 'Chymy Blog', url: 'https://example.com/' }];

		const [result] = await parseMedias(medias);
		if (!result) throw new Error('expected a result');

		expect(result).toMatchObject({
			name: 'Chymy Blog',
			url: 'https://example.com/',
			title: 'Chymy Blog',
			description: 'A blog about chymy'
		});
		expect(result).not.toHaveProperty('homepage');
		expect(result).not.toHaveProperty('homepage_html');
		expect(result.rss).toHaveLength(1);
		expect(result.rss[0]?.url).toBe('https://example.com/rss.xml');
	});
});
