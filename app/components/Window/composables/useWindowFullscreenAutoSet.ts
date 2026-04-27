import { storeToRefs } from "pinia";
import { useBoundsStore } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import { useWindowsStore } from "~/stores/windows";
import { OFFSET } from "~/utils/constants/offset";
import { FULLSCREEN_AUTO_SET_DELAY_MS } from "~/utils/constants/timing";
import type { WindowOb } from "../types";

/**
 * Автоматический переход в fullscreen при перетаскивании окна за границы.
 *
 * Логика:
 * 1. Во время drag — следит за позицией окна через chained watcher
 * 2. Если окно вышло за границы — устанавливает fullscreen-ready
 * 3. После завершения drag — с задержкой FULLSCREEN_AUTO_SET_DELAY_MS включает fullscreen
 *
 * @param windowOb - Объект окна
 */
export function useWindowFullscreenAutoSet(windowOb: WindowOb) {
	const { area: contentArea } = storeToRefs(useContentAreaStore());
	const windowsStore = useWindowsStore();
	const target = useBoundsStore().ensure(windowOb.id).target;

	/**
	 * Проверяет, вышло ли окно за границы рабочей области.
	 * Использует OFFSET для создания "мёртвой зоны" у краёв.
	 */
	const isOutOfBounds = () => {
		const left = target.left;
		const top = target.top;
		const width = target.width;
		const height = target.height;
		return (
			left < OFFSET ||
			top < OFFSET ||
			left + width > contentArea.value.width - OFFSET ||
			top + height > contentArea.value.height - OFFSET
		);
	};

	// Chained watcher: следит за bounds только во время drag
	useSetChainedWatchers(
		() => windowOb.states.drag === true,
		() => ({
			left: target.left,
			top: target.top,
			width: target.width,
			height: target.height,
		}),
		() => {
			windowsStore.setState(windowOb.id, "fullscreen-ready", isOutOfBounds());
		},
	);

	// Watcher завершения drag — включает fullscreen с задержкой
	let dragEndTimer: ReturnType<typeof setTimeout> | null = null;
	watch(
		() => windowOb.states.drag === true,
		(v) => {
			// Безусловный cancel: drag-start (v=true) отменяет pending fullscreen;
			// drag-end (v=false) переставляет timer.
			if (dragEndTimer !== null) {
				clearTimeout(dragEndTimer);
				dragEndTimer = null;
			}
			if (!v) {
				dragEndTimer = setTimeout(() => {
					dragEndTimer = null;
					if (windowOb.states["fullscreen-ready"]) {
						windowsStore.setState(windowOb.id, "fullscreen", true);
					}
					windowsStore.clearState(windowOb.id, "fullscreen-ready");
				}, FULLSCREEN_AUTO_SET_DELAY_MS);
			}
		},
		{
			immediate: true,
		},
	);

	onScopeDispose(() => {
		if (dragEndTimer !== null) {
			clearTimeout(dragEndTimer);
			dragEndTimer = null;
		}
	});
}
