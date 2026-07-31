// Postbuild: копирует `server/assets/entry` в `.output/server/assets/entry`,
// потому что `scanTree` идёт прямым fs.readdir от process.cwd() и при
// `bun run preview` cwd = `.output`. Без этого шага API → 500 ENOENT.

import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve(process.cwd(), "server", "assets", "entry");
const dest = resolve(process.cwd(), ".output", "server", "assets", "entry");

if (!existsSync(source)) {
	console.warn(`[copy-entry] source not found, skip: ${source}`);
	process.exit(0);
}

cpSync(source, dest, { recursive: true });
console.log(`[copy-entry] ${source} -> ${dest}`);
