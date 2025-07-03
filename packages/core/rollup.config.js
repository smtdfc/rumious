import typescript from '@rollup/plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  external: ['rumious-compiler'],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: false,
    paths: {
      'rumious-compiler': !isProduction ?
        '../compiler/dist/index.js' :
        'rumious-compiler'
    }
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist']
    })
  ]
};