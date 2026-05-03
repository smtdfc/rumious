import terser from "@rollup/plugin-terser";
import swc from "@rollup/plugin-swc";
import del from "rollup-plugin-delete";
import nodeResolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";
import { getExternals } from "../../shared/build.js";

export default [
  {
    input: "./src/index.ts",
    external: getExternals(),
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: false,
    },

    plugins: [
      del({ targets: "dist/*" }),
      nodeResolve({
        extensions: [".ts", ".js"],
      }),
      swc({
        swc: {
          jsc: {
            parser: { syntax: "typescript" },
            target: "es2020",
          },
        },
      }),
      terser({
        compress: {
          ecma: 2020,
          module: true,
          toplevel: true,
          unsafe: true,
          passes: 3,
          drop_console: true,
          pure_getters: true,
          keep_fargs: false,
          unsafe_arrows: true,
        },
        format: {
          comments: false,
          ascii_only: true,
        },
        mangle: {
          toplevel: true,
          properties: {
            regex: /^_/,
          },
        },
      }),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
