import { HTMLElement } from 'node-html-parser';

// requires a string, returns a HTMLElement or undefined
type RuleStringToHtml = {
	method: 'parseHtml';
};

// requires a string, returns an object or undefined
type RuleStringToXml = {
	method: 'parseXml';
};

export type RulePreprocess =
	| RuleStringToHtml
	| RuleStringToXml

// requires a HTMLElement, returns a HTMLElement or undefined
type RuleQuerySelector = {
	method: 'querySelector';
	selector: (i: number | string) => string;
	index?: (i: number) => string | number;
};

// requires a HTMLElement, returns a string or undefined
type RuleText = {
	method: 'text';
};

// requires a HTMLElement, returns a string or undefined
type RuleAttributes = {
	method: 'attributes';
	selector: string;
};

// requires a string, returns a string
type RuleFormat = {
	method: 'format';
	selector: (str: string) => string;
};

// requires a string, returns a string or undefined
type RuleRegExp = {
	method: 'regexp';
	selector: RegExp;
};

// requires a string, returns a number
type RuleParseInt = {
	method: 'parseInt';
};

// requires a string, returns a date
type RuleDate = {
	method: 'date';
};

// requires an object
type RuleProject = {
	method: 'project';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selector: (object: any) => ParsedRecord;
};

type RuleDefaultValue = {
	method: 'default';
	selector: ParsedType;
};

type RuleLog = {
	method: 'log';
};

export type RuleAttribute =
	| RuleQuerySelector
	| RuleText
	| RuleRegExp
	| RuleParseInt
	| RuleAttributes
	| RuleFormat
	| RuleDate
	| RuleDefaultValue
	| RuleLog;

export type RuleObject = RuleProject;

export type ProcessConfig = ProcessConfigPreprocess | ProcessConfigAttribute | ProcessConfigObject;
export type ProcessConfigArray = Array<ProcessConfig>;

type BaseProcessConfig = {
	name: string;
};

export type ProcessConfigPreprocess = BaseProcessConfig & {
	from: 'preprocess';
} & RulePreprocess;

export type ProcessConfigAttribute = BaseProcessConfig & {
	from: 'attribute';
	rules: Array<RuleAttribute>;
};

export type ProcessConfigObject = BaseProcessConfig & {
	from: 'object';
	rules: Array<RuleObject>;
};

type BaseScrapFrom = {
	format: 'html' | 'xml';
};

type ScrapFromTypeIndex = {
	xtype: 'index';
	fromIndex: number;
	toIndex: number;
	page: (page: number) => string;
};

type ScrapFromTypeArray = {
	xtype: 'array';
	pages: Array<string>;
};

type ScrapFromType = ScrapFromTypeIndex | ScrapFromTypeArray;

export type DownloadScrapFrom = BaseScrapFrom &
	ScrapFromType & {
		type: 'download';
		wait?: number;
	};

export type ReadFileScrapFrom = BaseScrapFrom &
	ScrapFromType & {
		type: 'read-file';
	};

export type ScrapFrom = DownloadScrapFrom | ReadFileScrapFrom;

export type ScrapProcess = {
	type: 'scrap';
	keepPage?: boolean;
	fromIndex: number;
	toIndex: number;
	config: ProcessConfigArray;
};

export type Scrap = {
	name: string;
	from: ScrapFrom;
	process: ScrapProcess;
};

export type ParsedType = HTMLElement | string | number | Date | undefined;
export interface _ParsedRecord {
	[key: string]: ParsedType | _ParsedRecord;
}
export type ParsedRecord = _ParsedRecord | undefined;
