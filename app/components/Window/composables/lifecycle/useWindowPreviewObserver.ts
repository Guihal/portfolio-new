import { generatePreview } from "~/services/windowPreviewGenerator";
import { useBoundsStore } from "~/stores/bounds";
import { useFrameStore } from "~/stores/frame";
import { PREVIEW_DEBOUNCE_MS } from "~/utils/constants/timing";
import { debounce } from "~/utils/debounce";
import type { WindowOb } from "../../types";

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
	let lastBoundsKey = "";
	let lastMutationCount = 0;
	let mutationCount = 0;
	// sequenceId: защита от out-of-order resolution двух in-flight generatePreview
	// (slow toJpeg + повторная debounce-fire). Коммитим только если наш seq —
	// последний; иначе старый jpeg перезаписал бы новый → flicker.
	let sequenceId = 0;
	const shouldSkip = () =>
		windowOb.states.drag || windowOb.states.resize || windowOb.states.collapsed;

	const regenerate = debounce(async () => {
		if (!alive || shouldSkip()) return;
		// DPR в ключе: переезд окна между мониторами с разным devicePixelRatio
		// меняет растр toJpeg при идентичных CSS-bounds — нужен инвалидатор.
		const boundsKey = `${slot.calculated.width}x${slot.calculated.height}@${window.devicePixelRatio}`;
		if (boundsKey === lastBoundsKey && mutationCount === lastMutationCount)
			return;
		const mySeq = ++sequenceId;
		const localMutationCount = mutationCount;
		const jpeg = await generatePreview(wrapper, {
			width: slot.calculated.width,
			height: slot.calculated.height,
		});
		// Финальный alive guard после await: scope мог dispose'нуться.
		if (!alive || !jpeg) return;
		if (mySeq !== sequenceId) return;
		lastBoundsKey = boundsKey;
		lastMutationCount = localMutationCount;
		frameStore.set(windowOb.id, jpeg);
	}, PREVIEW_DEBOUNCE_MS);

	const observer = new MutationObserver(() => {
		mutationCount++;
		regenerate();
	});
	observer.observe(content, { childList: true, subtree: true });
	regenerate();

	return () => {
		alive = false;
		observer.disconnect();
		frameStore.remove(windowOb.id);
	};
}
