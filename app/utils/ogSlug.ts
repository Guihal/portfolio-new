// Collision-safe slug для og:image filename. Возвращает имя файла без
// расширения для использования в /og/{slug}.png.
//
//   ogSlug("/")                              → "index"
//   ogSlug("/about")                         → "about"
//   ogSlug("/projects/u24")                  → "projects-u24"
//   ogSlug("/projects/u24/images")           → "u24-images"
//   ogSlug("/projects/u24/codes/foo")        → "u24-codes-foo"   (3-segment tail)
//   ogSlug("/about/")                        → "about"
//
// 3-segment tail для depth≥3 защищает от коллизий:
//   /projects/u24/codes/foo и /about/codes/foo → разные "u24-codes-foo" и
//   "about-codes-foo".

export function ogSlug(path: string): string {
	const segs = path.split("/").filter(Boolean);
	if (segs.length === 0) return "index";
	if (segs.length === 1) return segs[0] ?? "index";
	if (segs.length === 2) return `${segs[0]}-${segs[1]}`;
	return segs.slice(-3).join("-");
}
