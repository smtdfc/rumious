const path = require("path");
const fs = require('fs-extra');
const { exec } = require('child_process');
const rollup = require("rollup");

module.exports = {
  "dev": async (argv) => {
    console.log(`🚀 Initializing   ... ! `);

    let currentDir = process.env.PWD;
    let configs = require(path.join(currentDir, "rumious.configs.json"));

    let entryPoint = path.join(currentDir, configs.entryPoint ?? "index.jsx");
    let outputDir = path.join(currentDir, configs.outputDir ?? "dist");
    console.log(`🚀 Initializing builder ... ! `);

    const inputOptions = {
      input: entryPoint,
      plugins: [
        require('@rollup/plugin-node-resolve')(),
        require('@rollup/plugin-commonjs')(),
        require('@rollup/plugin-babel')({
          babelHelpers: 'bundled',
          presets: ["rumious-babel-preset"],
        }),
      ]
    };

    const outputOptions = {
      file: path.join(outputDir, "bundle.min.js"),
      format: 'iife',
      name: 'RUMIOUS_APP',
      sourcemap: true
    };
    console.log(`🚀 Start bundling .. ! `);

    try {
      const bundle = await rollup.rollup(inputOptions);

      await bundle.write(outputOptions);
      console.log("🎉 Build successful!");
    } catch (error) {
      console.error('❌ Build failed: ', error);
    }
  }
}