import { storeToRefs } from "pinia";
import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import type { WindowOb } from "../types";

/**
 * Устанавливает размеры окна на всю контентную область (fullscreen).
 *
 * @param windowOb - Объект окна
 * @param isForce - Если true, синхронизирует calculated с target (для мгновенной установки без анимации)
 */
export function useOnFullscreen(windowOb: WindowOb, isForce = false) {
	const { area: contentArea } = storeToRefs(useContentAreaStore());

	const slot = useBoundsStore().ensure(windowOb.id);
	const { target, calculated } = slot;

	/**
	 * Устанавливает значение свойства.
	 * Если isForce — также обновляет calculated для мгновенного перехода.
	 */
	const set = (prop: WindowBoundsKey, value: number) => {
		target[prop] = value;
		if (isForce) {
			// Синхронизием calculated с target для мгновенной установки
			calculated[prop] = value;
		}
	};

	// Устанавливаем fullscreen размеры (0, 0, full width, full height)
	set("left", 0);
	set("top", 0);
	set("width", contentArea.value.width);
	set("height", contentArea.value.height);
}
