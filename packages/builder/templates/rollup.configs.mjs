import path from 'path';
import os from "os";
import fs from "fs";
import rumious from "./node_modules/rumious-builder/plugins/rollup.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
  plugins: [
    rumious()
  ],
};