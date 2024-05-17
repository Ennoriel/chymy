- [x] meta rules

  - [x] IterateRule
  - [x] SequenceRule
  - [x] RecordRule

- [x] action rules

  - [x] RuleDownload
  - [x] RuleReadFromFile
  - [x] RuleWriteToFile
    - [ ] create folder if does not exist
  - [x] RuleLog

- [x] HTML

  - [x] RuleQuerySelector
  - [x] RuleText
  - [x] RuleAttributes

- [x] String

  - [x] RuleRegExp
  - [x] RuleParseInt
  - [x] RuleDate
  - [x] RuleParseToHtml
  - [x] RuleParseAsXml
  - [x] RuleParseAsJson

- [x] Object

  - [x] IdentityRule
  - [x] DefaultRule
  - [x] ProjectRule

- [ ] array

  - [ ] sort
  - [ ] dedupe
  - [ ] flat

- [ ] accessors

  - [ ] RuleWriteToFile

- [ ] response ??

  - [ ] text()
  - [ ] json()

- [ ] combos

  - [ ] html-query-selector + html-text
  - [ ] record > string = record > project ??

- [ ] exceptions / undefined

  - [ ] html-query-selector + html-text plante si html-query-selector ne remonte rien

- [ ] add a getter to every rule
  - [ ] what happen with already existing ones (url, path)?
  - [ ] value, \_value
