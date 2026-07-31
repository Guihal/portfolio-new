// Zod-схема + reader для `entity.json` (см. CLAUDE.md "Контент портфолио").
// Вынесено из scanTree.ts чтобы уложиться в 150-LOC budget per RULES.md.

import { promises as fs } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { z } from "zod";
import type { Entity } from "~~/shared/types/filesystem";

export const EntitySchema = z.object({
	name: z.string(),
	programType: z.enum([
		"about",
		"explorer",
		"project",
		"tproject",
		"code",
		"showcase",
	]),
	hidden: z.boolean().optional(),
	year: z.string().optional(),
	tags: z.array(z.string()).optional(),
	description: z.string().optional(),
	links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
	summary: z.string().optional(),
});

export async function readJson(path: string): Promise<unknown | null> {
	try {
		return JSON.parse(await fs.readFile(path, "utf-8"));
	} catch {
		return null;
	}
}

export async function readEntity(dir: string): Promise<Entity | undefined> {
	const raw = await readJson(resolvePath(dir, "entity.json"));
	if (raw === null) return undefined;
	const parsed = EntitySchema.safeParse(raw);
	return parsed.success ? parsed.data : undefined;
}
