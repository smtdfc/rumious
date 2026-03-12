import { readFileSync } from "node:fs";
import { join } from "node:path";

export function getExternals() {
  try {
    const pkgPath = join(process.cwd(), "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

    return [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),

      /node_modules/,
    ];
  } catch (e) {
    return [];
  }
}
