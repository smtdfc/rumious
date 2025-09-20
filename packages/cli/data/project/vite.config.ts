import { defineConfig } from 'vite';
import rumious from '@rumious/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  plugins: [
    rumious({ configFile: resolve(__dirname, './rumious.config.json') }),
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    sourcemap: true,
    emptyOutDir: true,
  },
  publicDir: resolve(__dirname, 'public'),
  esbuild: {
    jsx: 'preserve',
  },
});
