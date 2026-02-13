import { Compiler } from "@rumious/compiler";
import type { Plugin } from "vite";

export default function vitePluginRumious(): Plugin {
  const compiler = new Compiler();
  return {
    name: "vite-plugin-rumious",

    apply: "serve",
    config(config) {},

    transform(code: string, id: string) {
      if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
        const result = compiler.compile(code, {
          filename: id,
          sourceMapFile: id,
          strictMode: true,
        });
        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}
