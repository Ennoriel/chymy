/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	extensionsToTreatAsEsm: ['.ts'],
	collectCoverage: true,
	collectCoverageFrom: ['./src/**'],
	coverageThreshold: {
		'./src/*.ts': {
			statements: 90,
			functions: 100
		}
	},
	globals: {
		fetch: global.fetch
	}
};
