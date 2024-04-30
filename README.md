# chymy

> Typescript web scraping utils

All the methods are typed, documented and tested

## documentation

### `handleFrom`

Allows to get data from a source:

- fetch
- read file

### `handleProcess`

Allows to parse data with a config in this order:

1. all string, xml and html rules in order
2. the object rules

## TODO

- [ ] create folder if it does not exist
- [ ] change writeFileSync file extension based on file type (add .xml)
- [ ] verify that:
  - [ ] a rule has only one preprocess step
  - [ ] each step has the correct input

```mermaid
stateDiagram-v2
    state if_state <<choice>>
    state "Gekii" as First
    [*] --> First: text hyper realistic
    state First {
        Still --> Moving
        Moving --> if_state
        if_state --> Crash: if n < 0
    }
    if_state --> [*] : if n >= 0
    Still --> [*]
    Crash --> [*]
```

```mermaid
stateDiagram-v2
  state if_type <<choice>>
  state "getPages()" as download.getPages
  state "getPages()" as readFile.getPages
  state "await content.text()" as response.text

  [*] --> if_type
  state handleFrom() {
    if_type --> ruleDownload(): type = "download"
    ruleDownload() --> download.getPages
    download.getPages --> fetch()
    fetch() --> response.text

    if_type --> ruleReadFile(): type = "read-file"
    ruleReadFile() --> readFile.getPages
    readFile.getPages --> readFileSync()
    readFileSync() --> file.toString()
  }
  
  response.text --> handleProcess()
  file.toString() --> handleProcess()
  
  state handleProcess() {
    preprocess --> attributes
    attributes --> object
  }
```
