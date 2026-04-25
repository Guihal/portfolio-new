import { useFocusStore } from "~/stores/focus";
import { useWindowsStore } from "~/stores/windows";
import type { FsFile } from "~~/shared/types/filesystem";
import type { WindowOb, WindowStates } from "../types";
import { useGetId } from "../utils/useGetId";

interface UseCreateAndRegisterWindowOptions {
	isForce?: boolean; // Игнорировать проверку на дубликаты
}

/**
 * Создаёт новое окно и регистрирует его в windows-сторе.
 *
 * Логика:
 * 1. Проверяет, существует ли уже окно с таким путём (если не isForce)
 * 2. Если существует — фокусирует его и возвращает null
 * 3. Если нет — создаёт новое окно с уникальным ID
 * 4. Добавляет в store и фокусирует
 *
 * @param file - Файл для окна
 * @param options - Опции (isForce для игнорирования дубликатов)
 * @returns WindowOb | null (null если окно уже существует)
 */
export function useCreateAndRegisterWindow(
	file: FsFile | string,
	options: UseCreateAndRegisterWindowOptions = {
		isForce: false,
	},
): WindowOb | null {
	const windowsStore = useWindowsStore();
	const focusStore = useFocusStore();

	const path = typeof file === "string" ? file : file.path;

	// Проверка на дубликат (окно с таким путём уже открыто)
	if (!options.isForce) {
		const existing = windowsStore.byPath(path);
		if (existing) {
			focusStore.focus(existing.id);
			return null;
		}
	}

	// Генерируем уникальный ID
	const id = useGetId();

	// Начальные состояния (пустые)
	const states: WindowStates = {};

	const realFile = typeof file === "string" ? null : file;

	const windowOb: WindowOb = {
		id,
		states,
		targetFile: {
			value: path,
		},
		file: realFile,
	};

	// Регистрируем окно в глобальном хранилище
	windowsStore.windows[id] = windowOb;

	// Bounds создаются лениво в bounds-сторе при первом обращении
	// Фокусируем новое окно (focus вызывается извне после монтирования — см. Window/index.vue)
	return windowOb;
}
