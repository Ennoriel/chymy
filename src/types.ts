import { HTMLElement } from 'node-html-parser';

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

type DefaultValue = {
	method: 'default';
	selector: ParsedType;
};

export type RuleAttribute =
	| RuleQuerySelector
	| RuleText
	| RuleRegExp
	| RuleParseInt
	| RuleAttributes
	| RuleFormat
	| RuleDate
	| DefaultValue;

export type RuleObject = RuleProject;

export type ProcessConfig = ProcessConfigHtml | ProcessConfigObject;
export type ProcessConfigArray = Array<ProcessConfig>;

type BaseProcessConfig = {
	name: string;
};

export type ProcessConfigHtml = BaseProcessConfig & {
	from: 'html';
	rules: Array<RuleAttribute>;
};

export type ProcessConfigObject = BaseProcessConfig & {
	from: 'object';
	rules: Array<RuleObject>;
};

type BaseScrapFrom = {
	fromIndex: number;
	toIndex: number;
	format: 'html';
};

export type DownloadScrapFrom = BaseScrapFrom & {
	type: 'download';
	url: (page: number) => string;
	wait?: number;
};

export type ReadFileScrapFrom = BaseScrapFrom & {
	type: 'read-file';
	path: (page: number) => string;
};

export type ScrapFrom = DownloadScrapFrom | ReadFileScrapFrom;

export type ScrapProcess = {
	type: 'scrap';
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
