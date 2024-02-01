import { HTMLElement } from 'node-html-parser';
import {
	ParsedType,
	RuleAttribute,
	RuleObject,
	ProcessConfigHtml,
	ProcessConfigObject,
	ProcessConfigArray,
	ParsedRecord,
	ScrapProcess
} from './types';
import { parse } from 'node-html-parser';

export function handleProcess(
	data: { page: number; content: string }[],
	processRule: ScrapProcess
) {
	const parsedValues = [];

	for (const { content } of data) {
		const root = parse(content);
		for (let index = processRule.fromIndex; index <= processRule.toIndex; index++) {
			parsedValues.push(processRules(processRule.config, index, root));
		}
	}

	return parsedValues;
}

export function processRules(config: ProcessConfigArray, index: number, root: HTMLElement) {
	const object = Object.fromEntries(
		config
			.filter((configItem): configItem is ProcessConfigHtml => configItem.from === 'html')
			.map(({ name, rules }) => [
				name,
				rules.reduce<ParsedType>(
					(accumulator, rule) => parseRuleAttribute(accumulator, rule, index),
					root
				)
			])
	);

	return config
		.filter((configItem): configItem is ProcessConfigObject => configItem.from === 'object')
		.map(({ rules }) => rules)
		.flat()
		.reduce((accumulator, rule) => parseRuleObject(accumulator, rule), object as ParsedRecord);
}

export function parseRuleAttribute(accumulator: ParsedType, rule: RuleAttribute, index: number) {
	if (rule.method === 'default') {
		return accumulator ?? rule.selector;
	} else if (typeof accumulator === 'string') {
		switch (rule.method) {
			case 'regexp':
				return accumulator.match(rule.selector)?.[0];
			case 'parseInt':
				return parseInt(accumulator) || undefined;
			case 'date':
				return new Date(accumulator);
		}
	} else if (accumulator && typeof accumulator === 'object' && 'querySelector' in accumulator) {
		switch (rule.method) {
			case 'querySelector': {
				const _index = rule.index ? rule.index(index) : index;
				return accumulator.querySelector(rule.selector(_index)) || undefined;
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
