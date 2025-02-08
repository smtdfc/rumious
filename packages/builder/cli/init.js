import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';

export default function init() {
  const currentDir = process.env.PWD;
  const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../templates');
  console.log('🚀 Initializing files  ... ! ');

  if (!fs.existsSync(templatePath)) {
    console.error(`🚨 Error: Source template folder does not exist at ${templatePath}`);
    return;
  }

  fs.copy(templatePath, currentDir)
    .then(() => {
      console.log('📦 npm installing package ... ! ');
      exec(`npm install ${process.env.FORCE_INSTALL ?'--no-bin-links' :''} `, { cwd: path.join(currentDir) }, (err, stdout, stderr) => {
        if (err) {
          console.error(`🚨 Error running npm install: ${err.message}`);
          return;
        }
        if (stderr) {
          console.error(`⚠️ npm install warning: ${stderr}`);
        }
        console.log('📦 npm install completed successfully!');
        console.log('✅ Process completed ! ');
      });
    })
    .catch(err => {
      console.error(`🚨 Error during copy operation: ${err.message}`);
    });
}