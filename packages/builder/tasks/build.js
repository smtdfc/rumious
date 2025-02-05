const path = require("path");
const fs = require('fs-extra');
const { exec } = require('child_process');

module.exports = {
  "dev": async (argv) => {
    console.log(`🚀 Initializing   ... ! `);

    let currentDir = process.env.PWD;
    let configs = require(path.join(currentDir, "rumious.configs.json"));

    let entryPoint = path.join(currentDir, configs.entryPoint ?? "index.jsx");
    let outputDir = path.join(currentDir, configs.outputDir ?? "dist");
    console.log(`🚀 Initializing builder ... ! `);

    exec(`rollup -c ./rollup.config.mjs --watch`, { cwd: path.join(currentDir) }, (err, stdout, stderr) => {
      if (err) {
        console.error(`🚨 Error running : ${err.message}`);
        return;
      }
      if (stderr) {
        console.error(`⚠️  warning: ${stderr}`);
      }
      console.log(`✅ Process completed ! `);
    });
  },
  "prod": async (argv) => {
    console.log(`🚀 Initializing   ... ! `);

    let currentDir = process.env.PWD;
    let configs = require(path.join(currentDir, "rumious.configs.json"));

    let entryPoint = path.join(currentDir, configs.entryPoint ?? "index.jsx");
    let outputDir = path.join(currentDir, configs.outputDir ?? "dist");
    console.log(`🚀 Initializing builder ... ! `);

    exec(`rollup -c ./rollup.config.mjs`, { cwd: path.join(currentDir) }, (err, stdout, stderr) => {
      if (err) {
        console.error(`🚨 Error running : ${err.message}`);
        return;
      }
      if (stderr) {
        console.error(`⚠️  Warning: ${stderr}`);
      }
      console.log(`✅ Process completed. Production is ready !`);
    });
  }
}