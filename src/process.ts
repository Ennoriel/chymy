import {
	ParsedType,
	RuleAttribute,
	RuleObject,
	ProcessConfigAttribute,
	ProcessConfigObject,
	ProcessConfigArray,
	ParsedRecord,
	ScrapProcess,
	ProcessConfigPreprocess
} from './types';
import { parse } from 'node-html-parser';
import { XMLParser } from 'fast-xml-parser'

const xmlParser = new XMLParser();

export function handleProcess(
	data: { page: string; content: string }[],
	processRule: ScrapProcess
) {
	const parsedValues = [];

	for (const { content, page } of data) {
		for (let index = processRule.fromIndex; index <= processRule.toIndex; index++) {
			const result = processRules(processRule.config, index, content)
			if (result && processRule.keepPage) result.page = page
			parsedValues.push(result);
		}
	}

	return parsedValues;
}

export function processRules(config: ProcessConfigArray, index: number, content: string) {

	const root = config
		.filter((configItem): configItem is ProcessConfigPreprocess => configItem.from === 'preprocess')
		.reduce<ParsedType>((accumulator, configItem) => parseStepPreprocess(accumulator, configItem), content)

	const object = Object.fromEntries(
		config
			.filter((configItem): configItem is ProcessConfigAttribute => configItem.from === 'attribute')
			.map(({ name, rules }) => [
				name,
				rules.reduce<ParsedType>(
					(accumulator, rule) => parseRuleAttribute(accumulator, rule, index),
					root
				)
			])
			.filter(([, v]) => v !== undefined)
	);

	return config
		.filter((configItem): configItem is ProcessConfigObject => configItem.from === 'object')
		.map(({ rules }) => rules)
		.flat()
		.reduce((accumulator, rule) => parseRuleObject(accumulator, rule), object as ParsedRecord);
}

export function parseStepPreprocess(accumulator: ParsedType, step: ProcessConfigPreprocess) {
	if (step.method === "parseHtml" && typeof accumulator === 'string') {
		return parse(accumulator)
	} else if (step.method === "parseXml" && typeof accumulator === 'string') {
		return xmlParser.parse(accumulator)
	}
	return undefined
}

export function parseRuleAttribute(accumulator: ParsedType, rule: RuleAttribute, index: number) {
	if (rule.method === 'log') {
		console.log(accumulator)
		return accumulator;
	} else if (rule.method === 'default') {
		return accumulator ?? rule.selector;
	} else if (typeof accumulator === 'string') {
		switch (rule.method) {
			case 'regexp':
				return accumulator.match(rule.selector)?.[0];
			case 'parseInt':
				return parseInt(accumulator) || undefined;
			case 'date':
				return new Date(accumulator);
			case 'format':
				return rule.selector(accumulator);
		}
	} else if (accumulator && typeof accumulator === 'object' && 'querySelector' in accumulator) {
		switch (rule.method) {
			case 'querySelector': {
				const _index = rule.index ? rule.index(index) : index;
				try {
					return accumulator.querySelector(rule.selector(_index)) || undefined;
				} catch (e) {
					console.log(
						'error while processing rule querySelector with index:',
						index,
						'and selector:',
						rule.selector(_index),
						'.',
						e
					);
					return undefined;
				}
			}
			case 'text':
				return accumulator.text.trim();
			case 'attributes':
				return accumulator.getAttribute(rule.selector);
		}
	}
	return undefined;
}

export function parseRuleObject(accumulator: ParsedRecord, rule: RuleObject) {
	switch (rule.method) {
		case 'project':
			return rule.selector(accumulator);
	}
}
