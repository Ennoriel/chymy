import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import pkg from './package.json' with { type: 'json' };

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
				sourcemap: true
			},
			{
				file: pkg.module,
				format: 'es',
				sourcemap: true
			}
		],
		plugins: [nodeResolve(), commonjs(), typescript()]
	},
	{
		input: 'src/index.ts',
		output: {
			file: pkg.types,
			format: 'es'
		},
		plugins: [nodeResolve(), dts()]
	}
];
