// P8-03 — runtime-валидация ответа /api/filesystem/get.
// Edge-case parsing: используется когда нужно гарантировать shape (cache, persisted state).
// Server уже валидирует через zod; клиентский guard защищает от misconfiguration / proxy mangling.

import type { Entity, FsFile, ProgramType } from "~~/shared/types/filesystem";
import { FsServerError } from "./errors";

const PROGRAM_TYPES: ReadonlySet<ProgramType> = new Set([
	"explorer",
	"project",
	"tproject",
	"about",
]);

function isEntity(value: unknown): value is Entity {
	if (!value || typeof value !== "object") return false;
	const v = value as Record<string, unknown>;
	if (typeof v.name !== "string") return false;
	if (typeof v.programType !== "string") return false;
	if (!PROGRAM_TYPES.has(v.programType as ProgramType)) return false;
	if (v.hidden !== undefined && typeof v.hidden !== "boolean") return false;
	return true;
}

export function isFsFile(value: unknown): value is FsFile {
	if (!isEntity(value)) return false;
	const v = value as Record<string, unknown>;
	return typeof v.path === "string";
}

export function parseFsFile(raw: unknown): FsFile {
	if (!isFsFile(raw)) {
		throw new FsServerError("Invalid FsFile shape from /api/filesystem");
	}
	return raw;
}
