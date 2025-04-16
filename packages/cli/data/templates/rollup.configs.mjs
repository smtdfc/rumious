import typescript from '@rollup/plugin-typescript';
import rumious from 'rollup-plugin-rumious';


export default {
	input: 'src/index.ts',
	output: {
		file: 'dist/index.js',
		format: 'esm',
		sourcemap: false 
	},
	plugins: [
		rumious(),
		typescript({ tsconfig: './tsconfig.json' }),
	]
};