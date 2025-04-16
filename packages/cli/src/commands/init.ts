import * as fs from 'fs/promises';
import * as path from 'path';

interface CopyOptions {
	overwrite ? : boolean;
	verbose ? : boolean;
}

async function copyDirectory(
	sourceDir: string,
	destDir: string,
	options: CopyOptions = {}
): Promise < void > {
	const { overwrite = false, verbose = false } = options;
	
	try {
		await fs.mkdir(destDir, { recursive: true });
		if (verbose) {
			console.log(`Destination directory created/exists: ${destDir}`);
		}
		
		const items = await fs.readdir(sourceDir, { withFileTypes: true });
		
		for (const item of items) {
			const sourcePath = path.join(sourceDir, item.name);
			const destPath = path.join(destDir, item.name);
			
			if (item.isDirectory()) {
				if (verbose) {
					console.log(`Copy folder: ${sourcePath} -> ${destPath}`);
				}
				await copyDirectory(sourcePath, destPath, options);
			} else {
				try {
					const destStat = await fs.stat(destPath);
					if (destStat && !overwrite) {
						if (verbose) {
							console.log(`Skip (already exists): ${destPath}`);
						}
						continue;
					}
				} catch (error) {
					
				}
				
				await fs.copyFile(sourcePath, destPath);
				if (verbose) {
					console.log(`File copied: ${sourcePath} -> ${destPath}`);
				}
			}
		}
	} catch (error) {
		throw new Error(`Error copying folder: ${(error as Error).message}`);
	}
}


export function initCommand(name: string) {
	console.log("📝 Project initialization ....");
	const currentDir = process.cwd();
	copyDirectory(
		path.join(__dirname, "../data/templates"),
		path.join(currentDir, `${name}`),
	);
	console.log("🎉 The project has been successfully initiated. ");
}