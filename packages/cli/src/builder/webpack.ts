import { Builder } from './builder.js';
import { spawn } from 'child_process';

export class WebpackBuilder extends Builder {
  run(): void {
    const args = ['--config', this.configFilePath];
    if (this.watch) args.push('--watch');
    
    console.log(`📦 Running Webpack (${this.watch ? 'watch' : 'build'})...`);
    
    const webpackProcess = spawn('webpack', args, {
      cwd: this.currentDir,
      stdio: 'inherit',
      shell: true,
    });
    
    webpackProcess.on('error', (err) => {
      console.error(`❌ Webpack spawn error: ${err.message}`);
    });
    
    webpackProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Webpack exited with code ${code}`);
      } else {
        console.log(`✅ Webpack finished with code ${code}`);
      }
    });
  }
}