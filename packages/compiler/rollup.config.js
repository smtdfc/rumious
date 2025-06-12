import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  external: ['rumious-compiler'],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: true,
    paths: {
      'rumious-compiler': '../compiler/dist/index.js'
    }
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' })
  ]
};