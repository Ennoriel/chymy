# chymy

## 0.3.0

### Minor Changes

- 6425562: Add iterate strategies: sequence & parallel

## 0.2.3

### Patch Changes

- eb64ae2: improve cleanString method (add second step to decode html entities)
- fd9fbc7: add get method to rules: log, parse-to-html, parse-as-xml and parse-as-json

## 0.2.1

### Patch Changes

- f0c0ec3: bump dependencies (all minor, except @rollup/plugin-commonjs major)

## 0.2.0

### Minor Changes

- b6baab4: replace fast-xml-parser library with xml-js library

### Patch Changes

- 06a1cbe: add rule first-non-null
- 31305a4: add get property to html-query-selector and html-query-selector-all
- a2ebd13: add clean rule
- 8cb1531: turn off eslint rule @typescript-eslint/no-explicit-any

## 0.1.2

### Patch Changes

- implement a getter attribute for the response-decode method

## 0.1.1

### Patch Changes

- fix response undefined second time arrayBuffer is called

## 0.1.0

### Minor Changes

- add rule response-decode (decoding is not made by default anymore when fetching)

## 0.0.3

### Patch Changes

- rewrite the lib to linearize with only rules
