import { generatePreview } from "~/services/windowPreviewGenerator";
import { useBoundsStore } from "~/stores/bounds";
import { useFrameStore } from "~/stores/frame";
import { debounce } from "~/utils/debounce";
import type { WindowOb } from "../types";

// Дебаунс перегенерации preview — частые DOM-мутации (typing, scroll, hover)
// не должны дёргать html-to-image (тяжёлая операция, ~50–200ms на средний layout).
// Магический литерал — сохраняется до P8-09 (выносится в utils/constants/timing.ts).
const PREVIEW_DEBOUNCE_MS = 500;

/**
 * P8-06: lifecycle MutationObserver + screenshot generator.
 * Заменяет stores/frame.ts:createObserver — store больше не держит DOM-ссылок.
 *
 * Контракт: caller (composable в setup-фазе) обязан вызвать возвращённый
 * cleanup в onUnmounted. Вызывать саму функцию — только из onMounted
 * (нужен реальный DOM окна).
 *
 * Возвращает no-op cleanup, если SSR / DOM окна не найден / уже unmounted.
 */
export function useWindowPreviewObserver(windowOb: WindowOb): () => void {
	if (!import.meta.client) return () => {};

	const el = document.getElementById(`window-${windowOb.id}`);
	if (!el) return () => {};
	const wrapper = el.querySelector<HTMLElement>(".window__wrapper");
	if (!wrapper) return () => {};
	const content = el.querySelector<HTMLElement>(".window__content");
	if (!content) return () => {};

	const frameStore = useFrameStore();
	const slot = useBoundsStore().ensure(windowOb.id);
	let alive = true;
	const shouldSkip = () =>
		windowOb.states.drag || windowOb.states.resize || windowOb.states.collapsed;

	const regenerate = debounce(async () => {
		if (!alive || shouldSkip()) return;
		const jpeg = await generatePreview(wrapper, {
			width: slot.calculated.width,
			height: slot.calculated.height,
		});
		// Финальный alive guard после await: scope мог dispose'нуться.
		if (!alive || !jpeg) return;
		frameStore.set(windowOb.id, jpeg);
	}, PREVIEW_DEBOUNCE_MS);

	const observer = new MutationObserver(() => regenerate());
	observer.observe(content, { childList: true, subtree: true });
	regenerate();

	return () => {
		alive = false;
		observer.disconnect();
		frameStore.remove(windowOb.id);
	};
}
