#!/usr/bin/env bun
/**
 * P8-01 — docs/RULES.md drift check.
 *
 * Сверяет hash в header'е RULES.md с git log этого файла. Header формат:
 *   > **Last updated:** <7..40 hex>
 *
 * Header валиден если matches либо HEAD-of-RULES.md либо parent (1 commit ago).
 * Parent allowance решает self-pin paradox: коммит, который *устанавливает*
 * header, может ссылаться на parent commit (header pinned ДО commit-а),
 * после commit'а git log даст новый hash — header staleness на 1 commit OK.
 *
 * После *следующего* PR который трогает RULES.md (без обновления header)
 * parent перестанет совпадать → fail.
 *
 * Запускается lefthook pre-push hook'ом (см. lefthook.yml).
 */
import { spawnSync } from "node:child_process";

const RULES_PATH = "docs/RULES.md";
const HEADER_RE = /^>\s*\*\*Last updated:\*\*\s+([a-f0-9]{7,40})\b/m;

async function main(): Promise<void> {
	let text: string;
	try {
		text = await Bun.file(RULES_PATH).text();
	} catch (err) {
		console.error(
			`drift-check: cannot read ${RULES_PATH}: ${(err as Error).message}`,
		);
		process.exit(1);
	}
	const match = HEADER_RE.exec(text);
	if (!match) {
		console.error(
			`drift-check: ${RULES_PATH} header malformed. Expected line:\n` +
				"  > **Last updated:** <git-hash>\n" +
				"Update header to match `git log -1 --format=%h docs/RULES.md`.",
		);
		process.exit(1);
	}
	const headerHash = match[1]!.slice(0, 7);
	const result = spawnSync(
		"git",
		["log", "-2", "--format=%h", "--", RULES_PATH],
		{
			encoding: "utf8",
		},
	);
	if (result.status !== 0) {
		console.error(`drift-check: git log failed: ${result.stderr}`);
		process.exit(1);
	}
	const gitHashes = result.stdout
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.map((h) => h.slice(0, 7));
	if (gitHashes.length === 0) {
		console.error(`drift-check: no git history for ${RULES_PATH}.`);
		process.exit(1);
	}
	if (gitHashes.includes(headerHash)) {
		console.log(
			`RULES.md drift OK (header=${headerHash}, latest=${gitHashes[0]}).`,
		);
		return;
	}
	console.error(
		`drift-check: RULES.md drift detected.\n` +
			`  header says: ${headerHash}\n` +
			`  git latest:  ${gitHashes[0]}\n` +
			`  git parent:  ${gitHashes[1] ?? "(none)"}\n` +
			`Update header in ${RULES_PATH} to match git latest.`,
	);
	process.exit(1);
}

await main();
