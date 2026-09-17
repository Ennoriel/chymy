import { parse } from '../../src';

export function parseMedias(medias: Array<{ name: string; url: string }>) {
	return parse(medias)
		.iterate((item) => item.record({ homepage: (v) => v.download((x) => x.url) }))
		.iterate((item) =>
			item.record({
				homepage_html: (v) =>
					v
						.project((x) => x.homepage)
						.responseDecode()
						.parseToHtml()
			})
		)
		.iterate(
			(item) =>
				item
					.project((x) => x.homepage_html)
					.record(
						{
							title: (v) => v.htmlQuerySelector('head > title').htmlText(),
							description: (v) =>
								v.htmlQuerySelector('head > meta[name="description"]').htmlAttribute('content'),
							rss: (v) =>
								v
									.htmlQuerySelectorAll(
										'head > link[rel="alternate"][type="application/rss+xml"], a[href*="rss"], a[title*="rss"]'
									)
									.iterate((link) =>
										link
											.htmlAttribute('href')
											.record({
												url: (u, r) => u.project((x) => normalizeUrl(x as string, r.url))
											})
											.record({ content: (c) => c.download((x) => x.url) })
									)
						},
						{ discardPreviousSteps: true }
					)
					.mergeWithInput(),
			{ rebaseRoot: true }
		)
		.iterate((item) => item.deleteProperty('homepage_html'))
		.iterate((item) => item.deleteProperty('homepage'));
}

function normalizeUrl(path: string, url: string) {
	try {
		return new URL(path).toString();
	} catch {
		// path is relative, fall back to resolving it against url's origin
	}

	return new URL(url).origin + path;
}
