import { Rule } from "../../src";

export const config: Rule = {
    method: "sequence",
    sequence: [
        {
            method: "iterate",
            iterate: {
                method: "record",
                record: {
                    homepage: {
                        method: "download",
                        url: (value: any) => value.url
                    }
                }
            }
        },
        {
            method: "iterate",
            iterate: {
                method: "record",
                record: {
                    homepage_html: {
                        method: "sequence",
                        sequence: [
                            {
                                method: "project",
                                project: (value: any) => value.homepage
                            },
                            {
                                method: "parse-to-html",
                            }
                        ]
                    }
                }
            }
        },
        {
            method: "iterate",
            setCurrentItemAsInitialValue: true,
            iterate: {
                method: "sequence",
                keepInitialValue: true,
                sequence: [
                    {
                        method: "project",
                        project: (value: any) => value.homepage_html
                    },
                    {
                        method: "record",
                        discardPreviousSteps: true,
                        record: {
                            title: {
                                method: "sequence",
                                sequence: [
                                    {
                                        method: "html-query-selector",
                                        selector: "head > title"
                                    }, {
                                        method: "html-text"
                                    }
                                ]
                            },
                            description: {
                                method: "sequence",
                                sequence: [
                                    {
                                        method: "html-query-selector",
                                        selector: 'head > meta[name="description"]'
                                    }, {
                                        method: "html-attribute",
                                        attribute: "content"
                                    }
                                ]
                            },
                            rss: {
                                method: "sequence",
                                sequence: [
                                    {
                                        method: "html-query-selector-all",
                                        selector: 'head > link[rel="alternate"][type="application/rss+xml"], a[href*="rss"], a[title*="rss"]'
                                    }, {
                                        method: "iterate",
                                        iterate: {
                                            method: "sequence",
                                            sequence: [
                                                {
                                                    method: "html-attribute",
                                                    attribute: "href"
                                                }, {
                                                    method: "record",
                                                    record: {
                                                        url: {
                                                            method: "project",
                                                            project: (value, _value) => normalizeUrl(value, _value.url)
                                                        }
                                                    }
                                                }, {
                                                    method: "record",
                                                    record: {
                                                        content: {
                                                            method: "download",
                                                            url: (value: any) => value.url
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    },
                ]
            }
        },
        {
            method: "iterate",
            iterate: {
                method: "delete-property",
                property: "homepage_html"
            }
        },
        {
            method: "iterate",
            iterate: {
                method: "delete-property",
                property: "homepage"
            }
        },
    ]
}

function normalizeUrl(path: string, url: string) {
    try {
        return new URL(path).toString()
    } catch { }

    return (new URL(url)).origin + path
}
