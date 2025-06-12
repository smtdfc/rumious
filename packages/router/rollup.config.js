import typescript from '@rollup/plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  external: ['rumious-compiler'],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: true,
    paths: {
      'rumious-compiler': !isProduction ?
        '../compiler/dist/index.js' : 'rumious-compiler',
      'rumious': !isProduction ?
        '../../core/dist/index.js' : 'rumious'
    }
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' })
  ]
};