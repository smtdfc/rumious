import { rollupGenerateConfig } from 'rumious-builder/helpers/rollup.js'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  ...rollupGenerateConfig(path.join(__dirname, 'rumious.configs.json')),
}
