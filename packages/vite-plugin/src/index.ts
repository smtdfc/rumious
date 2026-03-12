import { compile, CompileOption } from "@rumious/compiler";
import type { Plugin } from "vite";

export default function vitePluginRumious(): Plugin {
  return {
    name: "vite-plugin-rumious",

    enforce: "pre",
    config(config) {},

    async transform(code: string, id: string) {
      if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
        let compileOption = new CompileOption();
        compileOption.file_name = id;

        const result = await compile(code, compileOption);

        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}
