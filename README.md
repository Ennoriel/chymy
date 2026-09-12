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

## TODO

- [ ] create folder if does not exist

- [ ] array

  - [ ] sort
  - [ ] dedupe
  - [ ] flat

- [ ] combos

  - [ ] html-query-selector + html-text
  - [ ] record > string = record > project ??

- [ ] exceptions / undefined

  - [ ] html-query-selector + html-text plante si html-query-selector ne remonte rien

- [ ] add a getter to every rule
  - [ ] what happen with already existing ones (url, path)?
  - [ ] value, \_value

https://effect.website/
