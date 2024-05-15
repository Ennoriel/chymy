import { readFileSync } from "fs";
import { Rule, parse } from "../src"

const xml = `<items>
    <item>
        <name> Couteau </name>
        <size> 12 </size>
    </item>
    <item>
        <name> Fourchette </name>
        <size> 14 </size>
    </item>
</items>`

const html = `<html>
    <body>
        <p>Hello world!</p>
        <ul>
            <li title="raspberry"> framboise </li>
            <li title="blackcurrant"> cassis </li>
            <li title="gooseberry"> groseille </li>
        </ul>
    </body>
</html>
`

/* @ts-ignore */
global.fetch = jest.fn(() =>
    Promise.resolve({
        text: () => Promise.resolve(html),
    })
);

jest.mock('node:fs', () => ({
    readFileSync,
    writeFileSync: jest.fn(),
}));

describe("parse", () => {
    describe("action", () => {
        it("download", async () => {
            const config = { method: "download", url: (v) => v } satisfies Rule
            const value = "http://localhost:5173"
            const result = html
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("read-file", async () => {
            const config = { method: "read-file", path: "./test/static_file.txt" } satisfies Rule
            const value = undefined
            const result = "Hello world!"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("write-file", async () => {
            const config = { method: "write-file", path: "./src/do_not_commit.txt" } satisfies Rule
            const value = "12azert34"
            const result = value
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("log", async () => {
            const config = { method: "log" } satisfies Rule
            const value = "12azert34"
            const result = value
            expect(await parse(config, value)).toStrictEqual(result)
        })
    })
    describe("string", () => {
        it("regexp", async () => {
            const config = { method: "regexp", regexp: /[a-z]+/ } satisfies Rule
            const value = "12azert34"
            const result = "azert"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("parseInt", async () => {
            const config = { method: "parseInt" } satisfies Rule
            const value = "123"
            const result = 123
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("date", async () => {
            const config = { method: "date" } satisfies Rule
            const value = "2024-05-01T08:42:26.558Z"
            const result = new Date(1714552946558)
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("parse-to-html", async () => {
            const config = {
                method: "sequence",
                sequence: [
                    { method: "parse-to-html" },
                    { method: "html-text" }
                ]
            } satisfies Rule
            const value = "<html><body>Hello world!</body></html>"
            const result = "Hello world!"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("parse-as-xml", async () => {
            const config = { method: "parse-as-xml" } satisfies Rule
            const value = xml
            const result = {
                items: {
                    item: [
                        { name: "Couteau", size: 12 },
                        { name: "Fourchette", size: 14 }
                    ]
                }
            }
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("parse-as-json", async () => {
            const config = { method: "parse-as-json" } satisfies Rule
            const result = { hello: "world!" }
            const value = JSON.stringify(result)
            expect(await parse(config, value)).toStrictEqual(result)
        })
    })

    describe("html", () => {
        it("html-query-selector & html-text", async () => {
            const config = {
                method: "sequence", sequence: [
                    { method: "parse-to-html" },
                    { method: "html-query-selector", selector: "html body p" },
                    { method: "html-text" }
                ]
            } satisfies Rule
            const value = html
            const result = "Hello world!"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("html-query-selector-all & html-attribute", async () => {
            const config = {
                method: "sequence", sequence: [
                    { method: "parse-to-html" },
                    { method: "html-query-selector-all", selector: "html body ul li" },
                    { method: "iterate", iterate: { method: "html-attribute", attribute: "title" } }
                ]
            } satisfies Rule
            const value = html
            const result = ["raspberry", "blackcurrant", "gooseberry"]
            expect(await parse(config, value)).toStrictEqual(result)
        })
    })

    describe("object", () => {
        it("identity", async () => {
            const config = { method: "identity" } satisfies Rule
            const value = { hello: "world!" }
            const result = value
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("default - with defined value", async () => {
            const config = { method: "default", default: "default string" } satisfies Rule
            const value = { hello: "world!" }
            const result = value
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("default - with undefined value", async () => {
            const config = { method: "default", default: "default string" } satisfies Rule
            const value = undefined
            const result = "default string"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("project", async () => {
            const config = { method: "project", project: (value) => value.hello } satisfies Rule
            const value = { hello: "world!" }
            const result = "world!"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("delete-property", async () => {
            const config = { method: "delete-property", property: "hello" } satisfies Rule
            const value = { hello: "world!" }
            const result = {}
            expect(await parse(config, value)).toStrictEqual(result)
        })
    })

    describe("meta", () => {
        it("iterate", async () => {
            const config = {
                method: "iterate", iterate:
                    { method: "project", project: (v) => v * 2 }
            } satisfies Rule
            const value = [1, 2, 3]
            const result = [2, 4, 6]
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("iterate - recursive with initial value", async () => {
            const config = {
                method: "iterate", setCurrentItemAsInitialValue: true, iterate:
                {
                    method: "sequence",
                    sequence: [
                        { method: "project", project: (v) => v.children },
                        {
                            method: "iterate", iterate: {
                                method: "project", project: (v, _v) => ({ name: v, parent: _v.name })
                            }
                        },
                    ]
                }
            } satisfies Rule
            const value = [
                { name: "John", children: ["Maria", "Jose"] },
                { name: "Edouard", children: ["Eleonora", "Gregoria"] }
            ]
            const result = [
                [
                    {
                        name: "Maria",
                        parent: "John",
                    },
                    {
                        name: "Jose",
                        parent: "John",
                    },
                ],
                [
                    {
                        name: "Eleonora",
                        parent: "Edouard",
                    },
                    {
                        name: "Gregoria",
                        parent: "Edouard",
                    },
                ]
            ]
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("sequence", async () => {
            const config = {
                method: "sequence", sequence: [
                    { method: "project", project: (v) => v * 2 },
                    { method: "project", project: (v) => `Hello ${v}` },
                ]
            } satisfies Rule
            const value = 42
            const result = "Hello 84"
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("sequence - keepInitialValues", async () => {
            const config = {
                method: "sequence", keepInitialValue: true, sequence: [
                    { method: "project", project: (v) => ({ capitalized: v.name.toLocaleUpperCase() }) },
                    { method: "project", project: (v) => ({ greeting: `Hello ${v.capitalized}!` }) },
                ]
            } satisfies Rule
            const value = { name: "John", age: 42 }
            const result = { name: "John", age: 42, greeting: "Hello JOHN!" }
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("sequence - use initial object", async () => {
            const config = {
                method: "sequence", keepInitialValue: true, sequence: [
                    { method: "project", project: (v) => ({ capitalized: v.name.toLocaleUpperCase() }) },
                    { method: "project", project: (v, _v) => ({ greeting: `Hello ${v.capitalized}! You are ${_v.age} years old!` }) },
                ]
            } satisfies Rule
            const value = { name: "John", age: 42 }
            const result = { name: "John", age: 42, greeting: "Hello JOHN! You are 42 years old!" }
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("record", async () => {
            const config = {
                method: "record", record: {
                    one: { method: "project", project: (v) => v * 2 },
                    two: { method: "project", project: (v) => `Hello ${v}` },
                }
            } satisfies Rule
            const value = 42
            const result = { one: 84, two: "Hello 42" }
            expect(await parse(config, value)).toStrictEqual(result)
        })

        it("record - with an object", async () => {
            const config = {
                method: "record", record: {
                    one: { method: "project", project: (v) => v.age * 2 },
                    two: { method: "project", project: (v) => `Hello ${v.name}` },
                }
            } satisfies Rule
            const value = { name: "John", age: 42 }
            const result = { name: "John", age: 42, one: 84, two: "Hello John" }
            expect(await parse(config, value)).toStrictEqual(result)
        })
    })
})
