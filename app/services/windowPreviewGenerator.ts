// P8-06: pure DOM-input screenshot generation для taskbar preview.
// html-to-image использует DOM API → dynamic import под import.meta.client guard
// (top-level import ломает SSR на server side).

export type GeneratePreviewOpts = {
	width: number;
	height: number;
};

/**
 * Создаёт JPEG Blob URL из DOM-элемента. На SSR / при ошибке html-to-image
 * (элемент скрыт, DPR 0, фоновое окно) возвращает null — caller хранит
 * последний успешный preview, чтобы не показывать placeholder во время
 * transient мутаций.
 *
 * Возвращает `blob:` URL вместо data:URL — освобождается через
 * `URL.revokeObjectURL` (frame store handle revoke на set/remove).
 */
export async function generatePreview(
	el: HTMLElement,
	opts: GeneratePreviewOpts,
): Promise<string | null> {
	if (typeof window === "undefined") return null;
	try {
		const htmlToImage = await import("html-to-image");
		const blob = await htmlToImage.toBlob(el, {
			width: opts.width,
			height: opts.height,
			cacheBust: true,
			quality: 1,
			type: "image/jpeg",
		});
		if (!blob) return null;
		return URL.createObjectURL(blob);
	} catch {
		return null;
	}
}
