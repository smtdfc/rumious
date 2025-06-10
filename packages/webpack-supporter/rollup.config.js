import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/loader/index.ts',
  external: ['rumious-compiler'],
  output: {
    file: './dist/loader/index.js',
    format: 'esm',
    sourcemap: true,
    paths: {
      'rumious-compiler': '../../../compiler/dist/index.js'
    }
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' })
  ]
};