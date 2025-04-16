import { jsonHelper } from "../utils/json.js";
import { RumiousConfigFile, BuildCommandOptions } from '../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

function runRollupWithSpawn(currentDir: string, rollupConfigFilePath: string, watch: boolean): void {
  const args = ['-c', rollupConfigFilePath];
  if (watch) args.push('-w');
  
  console.log(`📦 Running Rollup (${watch ? "watch" : "build"})...`);
  
  const rollupProcess = spawn('rollup', args, {
    cwd: currentDir,
    stdio: 'inherit',
    shell: true
  });
  
  rollupProcess.on('error', (err) => {
    console.error(`❌ Rollup spawn error: ${err.message}`);
  });
  
  rollupProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Rollup exited with code ${code}`);
    } else {
      console.log(`✅ Rollup finished with code ${code}`);
    }
  });
}

async function buildWithDevMode(currentDir: string, configs: RumiousConfigFile, options: BuildCommandOptions): Promise < void > {
  const rollupConfigFilePath = path.join(
    currentDir,
    configs.rollupConfigFile ?? "rollup.configs.mjs"
  );
  runRollupWithSpawn(currentDir, rollupConfigFilePath, options.watch ?? false);
}

async function buildWithProdMode(currentDir: string, configs: RumiousConfigFile): Promise < void > {
  const rollupConfigFilePath = path.join(
    currentDir,
    configs.rollupConfigFile ?? "rollup.configs.mjs"
  );
  
  process.env.NODE_ENV = "production";
  
  runRollupWithSpawn(currentDir, rollupConfigFilePath, false);
}

export async function buildCommand(mode: string = "dev", options: BuildCommandOptions): Promise < void > {
  console.log("📝 Checking configuration ....");
  const currentDir = process.cwd();
  const configsFilePath = jsonHelper.readJsonSync(
    path.join(currentDir, "rumious.configs.json")
  );
  
  switch (mode) {
    case "dev":
      await buildWithDevMode(currentDir, configsFilePath, options);
      break;
    case "prod":
      await buildWithProdMode(currentDir, configsFilePath);
      break;
    default:
      console.log("❌ Invalid mode provided.");
      break;
  }
}