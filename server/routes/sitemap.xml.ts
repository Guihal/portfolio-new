// Sitemap: генерируется из scanTree() на каждый запрос (Nitro кеширует
// ответ через routeRules, если потребуется — добавить). Root "/" эмитится
// unconditional, чтобы он был в sitemap даже если server/assets/entry/entity.json
// отсутствует.

import { setResponseHeader } from "h3";
import { scanTree } from "~~/server/utils/manifest/scanTree";
import type { Entity, ProgramType } from "~~/shared/types/filesystem";

const PRIORITY: Record<ProgramType, number> = {
	about: 1.0,
	project: 0.8,
	showcase: 0.8,
	code: 0.6,
	explorer: 0.5,
	tproject: 0.5,
};

function priorityFor(entity: Entity): number {
	return PRIORITY[entity.programType] ?? 0.5;
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export default defineEventHandler(async (event) => {
	const url = new URL(getRequestURL(event));
	const origin = url.origin;
	const { flatIndex } = await scanTree();

	const urls: { loc: string; lastmod?: string; priority: number }[] = [];

	// Root — всегда.
	urls.push({ loc: `${origin}/`, priority: 1.0 });

	for (const [path, entry] of Object.entries(flatIndex)) {
		if (!entry?.entity) continue;
		if (path === "/") continue; // уже добавлен выше
		urls.push({
			loc: `${origin}${path}`,
			lastmod: entry.mtime,
			priority: priorityFor(entry.entity),
		});
	}

	const body =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>
`;

	setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
	return body;
});
