import { Builder } from './builder.js';
import { spawn } from 'child_process';

export class RollupBuilder extends Builder {
  run(): void {
    const args = ['-c', this.configFilePath];
    if (this.watch) args.push('-w');
    
    console.log(`📦 Running Rollup (${this.watch ? 'watch' : 'build'})...`);
    
    const rollupProcess = spawn('rollup', args, {
      cwd: this.currentDir,
      stdio: 'inherit',
      shell: true,
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
}