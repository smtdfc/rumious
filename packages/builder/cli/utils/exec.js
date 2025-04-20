import { exec } from 'child_process';

export function exec_command(command, options) {
  return new Promise((resolve, ) => {
    const task = exec(command, { cwd: options.cwd });
    
    task.stdout.on('data', (data) => {
      if(options.showLog) console.log(`${data}`);
    });
    
    task.stderr.on('data', (data) => {
      if(options.showErr) console.error(`${data}`);
    });
    
    task.on('close', (code) => {
      resolve(code);
    });
  });
}