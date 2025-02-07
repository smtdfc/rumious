const path = require("path");
const fs = require('fs-extra');
const { exec } = require('child_process');
const { generateConfigFile } = require("../helpers/rollup.js");

module.exports = {
  "dev": async () => {
    console.log(`🚀 Initializing development environment...`);

    let currentDir = process.env.PWD;
    let configs;

    // Load configuration from rumious.configs.json
    try {
      configs = require(path.join(currentDir, "rumious.configs.json"));
      console.log("✅ Configuration loaded successfully.");
    } catch (error) {
      console.error("🚨 Failed to load configuration: ", error);
      return;
    }

    // Determine entry point and output directory from configuration
    let outputDir = path.join(currentDir, configs.outputDir ?? "dist");

    // Clear the output directory if it exists
    if (fs.existsSync(outputDir)) {
      console.log(`⚠️ Output directory exists at ${outputDir}. Removing previous build...`);
      try {
        fs.rmdirSync(outputDir, { recursive: true });
        console.log(`✅ Successfully removed the existing output directory: ${outputDir}`);
      } catch (err) {
        console.error(`🚨 Failed to remove output directory: ${err}`);
        return;
      }
    }

    console.log(`🚀 Initializing Rollup configuration file...`);
    try {
      generateConfigFile(
        path.join(currentDir, "rollup.config.mjs"),
        configs.entryPoint,
        configs.outputDir
      );
      console.log("✅ Rollup configuration generated successfully.");
    } catch (err) {
      console.error("🚨 Failed to generate Rollup configuration: ", err);
      return;
    }

    console.log(`🚀 Bundling the application...`);
    const task = exec(`rollup -c ./rollup.config.mjs`, { cwd: path.join(currentDir) });

    // Output Rollup process stdout
    task.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    // Output Rollup process stderr
    task.stderr.on('data', (data) => {
      console.error(`${data}`);
    });

    task.on('close', (code) => {
      if (code !== 0) {
        console.error(`🚨 Process exited with error code ${code}`);
      } else {
        console.log('✅ Bundling completed successfully!');
      }
    });
  },
  "prod": async () => {
    console.log("🚀 Preparing production environment... ");
    let currentDir = process.env.PWD;
    let configs;

    // Load configuration from rumious.configs.json
    try {
      configs = require(path.join(currentDir, "rumious.configs.json"));
      console.log("✅ Configuration loaded successfully.");
    } catch (error) {
      console.error("🚨 Failed to load configuration: ", error);
      return;
    }

    // Determine entry point and output directory from configuration
   let outputDir = path.join(currentDir, configs.outputDir ?? "dist");

    // Clear the output directory if it exists
    if (fs.existsSync(outputDir)) {
      console.log(`⚠️ Output directory exists at ${outputDir}. Removing previous build...`);
      try {
        fs.rmdirSync(outputDir, { recursive: true });
        console.log(`✅ Successfully removed the existing output directory: ${outputDir}`);
      } catch (err) {
        console.error(`🚨 Failed to remove output directory: ${err}`);
        return;
      }
    }

    console.log(`🚀 Initializing Rollup configuration file...`);
    try {
      generateConfigFile(
        path.join(currentDir, "rollup.config.mjs"),
        configs.entryPoint,
        configs.outputDir,
        true
      );
      console.log("✅ Rollup configuration generated successfully.");
    } catch (err) {
      console.error("🚨 Failed to generate Rollup configuration: ", err);
      return;
    }

    console.log(`🚀 Bundling the application...`);
    const task = exec(`rollup -c ./rollup.config.mjs`, { cwd: path.join(currentDir) });

    // Output Rollup process stdout
    task.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    // Output Rollup process stderr
    task.stderr.on('data', (data) => {
      console.error(`${data}`);
    });

    task.on('close', (code) => {
      if (code !== 0) {
        console.error(`🚨 Process exited with error code ${code}`);
      } else {
        console.log('✅ Bundling completed successfully!');
      }
    });

  }
};