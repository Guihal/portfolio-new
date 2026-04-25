import { storeToRefs } from "pinia";
import { useBoundsStore } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import { OFFSET } from "~/utils/constants/offset";
import type { WindowOb } from "../types";

/**
 * Автоматический переход в fullscreen при перетаскивании окна за границы.
 *
 * Логика:
 * 1. Во время drag — следит за позицией окна через chained watcher
 * 2. Если окно вышло за границы — устанавливает fullscreen-ready
 * 3. После завершения drag — с задержкой 10ms включает fullscreen
 *
 * @param windowOb - Объект окна
 */
export function useWindowFullscreenAutoSet(windowOb: WindowOb) {
	const { area: contentArea } = storeToRefs(useContentAreaStore());
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
			if (isOutOfBounds()) {
				windowOb.states["fullscreen-ready"] = true;
			} else {
				delete windowOb.states["fullscreen-ready"];
			}
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
						windowOb.states.fullscreen = true;
					}
					delete windowOb.states["fullscreen-ready"];
				}, 10);
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
