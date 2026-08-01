// Нормализация trailing slash для page-маршрутов: /about/ → /about (301).
// Не трогаем: корень, API, ассеты Nuxt, пути с расширением файла.
// Защита от protocol-relative open redirect: pathname, начинающийся с "//",
// не редиректим — иначе Location: //evil.com увёл бы на внешний хост.

const SKIP_PREFIXES = ["/api/", "/_nuxt/"] as const;

function isFileLike(pathname: string): boolean {
	const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";
	return lastSegment.includes(".");
}

export function normalizeTrailingSlashPath(pathname: string): string | null {
	if (pathname === "/") return null;
	if (pathname.startsWith("//")) return null;
	if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return null;
	if (isFileLike(pathname)) return null;
	if (!pathname.endsWith("/")) return null;
	return pathname.slice(0, -1);
}
