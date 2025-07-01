import typescript from '@rollup/plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/loader/index.ts',
  external: ['rumious-compiler'],
  output: {
    file: './dist/loader/index.js',
    format: 'esm',
    sourcemap: true,
    paths: {
      'rumious-compiler': !isProduction ? '../../../compiler/dist/index.js' : 'rumious-compiler'
    }
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' })
  ]
};