// Единая точка резолва entry-относительных путей в абсолютные.
// Пути из манифеста приходят с ведущим слэшем (`/projects/u24`), а
// resolve(root, "/projects/u24") даёт "/projects/u24" — вне root. Плюс здесь же
// containment-проверка: всё, что вылезает из entry/, отбрасывается.

import { resolve, sep } from "node:path";

export const ENTRY_ROOT = resolve(process.cwd(), "server/assets/entry");

export function resolveEntryPath(path: string): string | null {
	const full = resolve(ENTRY_ROOT, path.replace(/^\/+/, ""));
	if (full !== ENTRY_ROOT && !full.startsWith(ENTRY_ROOT + sep)) return null;
	return full;
}
