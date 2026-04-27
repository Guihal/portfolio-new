// P8-06: pure DOM-input screenshot generation для taskbar preview.
// html-to-image использует DOM API → dynamic import под import.meta.client guard
// (top-level import ломает SSR на server side).

export type GeneratePreviewOpts = {
	width: number;
	height: number;
};

/**
 * Создаёт JPEG dataURL из DOM-элемента. На SSR / при ошибке html-to-image
 * (элемент скрыт, DPR 0, фоновое окно) возвращает null — caller хранит
 * последний успешный preview, чтобы не показывать placeholder во время
 * transient мутаций.
 */
export async function generatePreview(
	el: HTMLElement,
	opts: GeneratePreviewOpts,
): Promise<string | null> {
	if (typeof window === "undefined") return null;
	try {
		const htmlToImage = await import("html-to-image");
		return await htmlToImage.toJpeg(el, {
			width: opts.width,
			height: opts.height,
			cacheBust: true,
			quality: 1,
		});
	} catch {
		return null;
	}
}
