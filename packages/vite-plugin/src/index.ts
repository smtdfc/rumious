import { Compiler } from "@rumious/compiler";
import type { Plugin } from "vite";

export default function vitePluginRumious(): Plugin {
  return {
    name: "vite-plugin-rumious",

    enforce: "pre",
    config(config) {},

    async transform(code: string, id: string) {
      const compiler = new Compiler();
      if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
        const result = await compiler.compile(code, {
          filename: id,
          sourceMapFile: id,
          // strictMode: true,
        });

        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}
