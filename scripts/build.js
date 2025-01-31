const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, cwd) {
  try {
    execSync(command, { stdio: 'inherit', cwd });
  } catch (error) {
    console.error(`🚨 Error executing command in ${cwd}:`, error.message);
    throw error;
  }
}

function getPackages() {
  const packagesDir = path.join(__dirname, '../packages');
  const packages = fs.readdirSync(packagesDir).filter((pkg) => {
    const pkgPath = path.join(packagesDir, pkg);
    return fs.statSync(pkgPath).isDirectory() && fs.existsSync(path.join(pkgPath, 'rollup.config.mjs'));
  });
  return packages;
}

function runRollupForPackages() {
  const packages = getPackages();

  if (packages.length === 0) {
    console.log('🚨 No packages with rollup.config.mjs found.');
    return;
  }

  console.log('🌟 Starting Rollup process for the following packages:');
  packages.forEach((pkg) => {
    const packageDir = path.join(__dirname, '../packages', pkg);
    const rollupCommand = 'rollup -c --bundleConfigAsCjs';

    console.log(`🔄 Running Rollup for ${pkg}...`);
    try {
      runCommand(rollupCommand, packageDir);
      console.log(`✅ Rollup completed for ${pkg}`);
    } catch (error) {
      console.error(`❌ Rollup failed for ${pkg}:`, error.message);
    }
  });

  console.log('🎉 Rollup process complete for all packages!');
}

runRollupForPackages();