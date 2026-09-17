# chymy

## introduction

This library is a scraping library based on a single entry point, `parse(value)`, that
returns a lazy, awaitable, chainable pipeline.

## usage

```ts
import { parse } from 'chymy';

const result = await parse(medias)
	.iterate((item) =>
		item.record({
			homepage: (v) => v.download((u) => u.url)
		})
	)
	.log()
	.deleteProperty('raw');
```

Chains are lazy — nothing runs until the chain is `await`ed. Looping/branching methods
(`iterate`, `record`, `firstNonNull`) take a callback that receives a fresh chain scoped
to the item/branch; build on it and return it (or return a plain value/Promise for terse
cases).
