// Sitemap URL builder — чистая функция: flatIndex → список URL для sitemap.
// Showcase-ноды (изображения avif) исключаются: картинки индексируются как
// assets, а не как страницы — в sitemap они только жгут crawl budget.

import type { Entity, Manifest, ProgramType } from "~~/shared/types/filesystem";

export type SitemapUrl = {
	loc: string;
	lastmod?: string;
	priority: number;
};

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

export function buildSitemapUrls(
	flatIndex: Manifest["flatIndex"],
	origin: string,
): SitemapUrl[] {
	const urls: SitemapUrl[] = [{ loc: `${origin}/`, priority: 1.0 }];

	for (const [path, entry] of Object.entries(flatIndex)) {
		if (!entry?.entity) continue;
		if (path === "/") continue; // root уже добавлен unconditional
		if (entry.entity.programType === "showcase") continue;
		urls.push({
			loc: `${origin}${path}`,
			lastmod: entry.mtime,
			priority: priorityFor(entry.entity),
		});
	}

	return urls;
}
