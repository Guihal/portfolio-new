#!/usr/bin/env bun
/**
 * P8-01 — Vue SFC full-file size check.
 *
 * Считает non-blank LOC всего .vue (template + script + style).
 * Лимит default = 150. Whitelist override per-file.
 *
 * Modes:
 *   default — report mode (печатает violations, exit 0).
 *   --strict — fail mode (exit 1 на violations). Включается в P8-18.
 *
 * CLI:
 *   bun run scripts/check-vue-sfc-size.ts                    # все .vue (git ls-files)
 *   bun run scripts/check-vue-sfc-size.ts a.vue b.vue        # явный список
 *   bun run scripts/check-vue-sfc-size.ts --strict           # CI mode
 *
 * См. docs/RULES.md §3.1, §6.
 */
import { spawnSync } from "node:child_process";
import { isAbsolute, relative, resolve } from "node:path";

const REPO_ROOT = process.cwd();
const DEFAULT_LIMIT = 150;

/**
 * Whitelist: путь относительно repo root → разрешённый LOC.
 * Каждая запись должна иметь обоснование в docs/RULES.md §3.2 + sunset PR ID
 * (или метку permanent).
 */
const WHITELIST: Readonly<Record<string, number>> = {
	// Пусто на P8-01. Заполняется по мере sunset.
};

interface Violation {
	file: string;
	loc: number;
	limit: number;
}

async function countLoc(file: string): Promise<number> {
	const text = await Bun.file(file).text();
	let count = 0;
	for (const line of text.split("\n")) {
		if (line.trim().length > 0) count++;
	}
	return count;
}

function listAllVueFiles(): string[] {
	const result = spawnSync("git", ["ls-files", "*.vue"], { encoding: "utf8" });
	if (result.status !== 0) return [];
	return result.stdout
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

function parseArgs(): { strict: boolean; files: string[] } {
	const argv = process.argv.slice(2);
	const strict = argv.includes("--strict");
	const positional = argv.filter((a) => !a.startsWith("--"));
	const files =
		positional.length > 0
			? positional.filter((f) => f.endsWith(".vue"))
			: listAllVueFiles();
	return { strict, files };
}

function toRepoRel(file: string): string {
	const abs = isAbsolute(file) ? file : resolve(REPO_ROOT, file);
	return relative(REPO_ROOT, abs);
}

async function main(): Promise<void> {
	const { strict, files } = parseArgs();
	if (files.length === 0) {
		console.log("Vue SFC size: no files to check.");
		return;
	}
	const violations: Violation[] = [];
	for (const f of files) {
		const rel = toRepoRel(f);
		const limit = WHITELIST[rel] ?? DEFAULT_LIMIT;
		try {
			const loc = await countLoc(f);
			if (loc > limit) violations.push({ file: rel, loc, limit });
		} catch (err) {
			console.error(
				`check-vue-sfc-size: failed to read ${rel}: ${(err as Error).message}`,
			);
			if (strict) process.exit(1);
		}
	}
	if (violations.length === 0) {
		console.log(
			`Vue SFC size: ${files.length} files OK (limit ${DEFAULT_LIMIT}).`,
		);
		return;
	}
	console.log(`Vue SFC oversize (${violations.length}/${files.length}):`);
	for (const v of violations) {
		console.log(`  ${v.file}: ${v.loc} > ${v.limit}`);
	}
	if (strict) process.exit(1);
	console.log("(report mode — exit 0; --strict для fail)");
}

await main();
