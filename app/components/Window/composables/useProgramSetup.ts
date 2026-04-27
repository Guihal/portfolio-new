import { type ComputedRef, computed, provide } from "vue";
import { getProgram, type ProgramView } from "~/programs";
import { ProgramViewKey, type WindowOb } from "../types";

/**
 * Резолвит ProgramView для окна по `windowOb.file.programType` и provide'ит
 * результат через типизированный `ProgramViewKey`. Чисто-делегирующий слой
 * над `getProgram()` — без fetch, без DOM.
 *
 * `getProgram()` может вернуть `null` (неизвестный programType) — это
 * допустимое состояние, потребитель рендерит loader/empty. ComputedRef сам
 * по себе read-only (нет сеттера) — `readonly()` не нужен, и его обёртка
 * ломает структурную совместимость `Component` (deep-readonly conflict).
 */
export function useProgramSetup(windowOb: WindowOb): {
	programView: ComputedRef<ProgramView | null>;
} {
	const programView = computed<ProgramView | null>(() => {
		const file = windowOb.file;
		if (file === null) return null;
		return getProgram(file.programType);
	});

	provide(ProgramViewKey, programView);

	return { programView };
}
