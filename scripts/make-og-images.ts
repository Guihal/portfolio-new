// Post-build генерация per-entity og:image PNG (1200×630) для каждой ноды
// в flatIndex (entity + virtual showcase). Импортирует scanTree и ogSlug
// через `~~`-алиас (резолвится через bunfig.toml).
//
// НЕ импортит `app/programs/` (там Vite-only ?raw SVG), использует inline
// LABEL-map. НЕ импортит `~~/server/utils/manifest/loadManifest` (не существует
// с round 1).

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { scanTree } from "~~/server/utils/manifest/scanTree";
import { ogSlug } from "~~/app/utils/ogSlug";

const W = 1200;
const H = 630;

// Inline label — НЕ импортим getProgram (там Vite-only ?raw).
const LABEL: Record<string, string> = {
	about: "Информация о системе",
	project: "Проект",
	explorer: "Проводник",
	code: "Сниппет",
	showcase: "Скриншот",
	tproject: "Tilda-проект",
};

function escape(s: string): string {
	return s.replace(/[<>&"']/g, (c) =>
		({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c] ?? c),
	);
}

function svgFor(title: string, subtitle: string): string {
	// Длинные имена уменьшаем, чтобы не вылезали за края.
	const titleFs = title.length > 18 ? 56 : 72;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="#151515"/>
    <text x="60" y="${H / 2 - 40}" font-family="monospace" font-size="${titleFs}" fill="#cecece" font-weight="700">${escape(title)}</text>
    <text x="60" y="${H / 2 + 40}" font-family="monospace" font-size="36" fill="#40b567">${escape(subtitle)}</text>
    <text x="${W - 60}" y="${H - 40}" text-anchor="end" font-family="monospace" font-size="24" fill="#db481d">Dimonya OS</text>
  </svg>`;
}

async function gen(outName: string, title: string, subtitle: string) {
	const out = resolve(process.cwd(), "public", "og", `${outName}.png`);
	const buf = await sharp(Buffer.from(svgFor(title, subtitle))).png().toBuffer();
	await mkdir(resolve(out, ".."), { recursive: true });
	await writeFile(out, buf);
	console.log(`[make-og] ${out} (${buf.length}B)`);
}

const m = await scanTree();
let count = 0;
for (const [path, entry] of Object.entries(m.flatIndex)) {
	if (!entry?.entity) continue;
	await gen(ogSlug(path), entry.entity.name, LABEL[entry.entity.programType] ?? "");
	count++;
}
await gen(ogSlug("/"), "Портфолио Дмитрия Стаценко", "Dimonya OS");
count++;
console.log(`[make-og] generated ${count} PNG files`);
