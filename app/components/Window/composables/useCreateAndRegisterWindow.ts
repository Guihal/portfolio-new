import type { File } from '~~/shared/types/File';
import { useGetId } from '../utils/useGetId';
import type {
    WindowBounds,
    WindowFile,
    WindowOb,
    WindowStates,
} from '../Window';

interface UseCreateAndRegisterWindowOptions {
    isForce?: boolean; // Игнорировать проверку на дубликаты
}

/**
 * Создаёт новое окно и регистрирует его в allWindows.
 *
 * Логика:
 * 1. Проверяет, существует ли уже окно с таким путём (если не isForce)
 * 2. Если существует — фокусирует его и возвращает null
 * 3. Если нет — создаёт новое окно с уникальным ID
 * 4. Добавляет в allWindows и фокусирует
 *
 * @param file - Файл для окна
 * @param options - Опции (isForce для игнорирования дубликатов)
 * @returns WindowOb | null (null если окно уже существует)
 */
export function useCreateAndRegisterWindow(
    file: File | string,
    options: UseCreateAndRegisterWindowOptions = {
        isForce: false,
    },
): WindowOb | null {
    const { allWindows } = useAllWindows();
    const { hasPath } = useWindowPaths();
    const { focus } = useFocusWindowController();

    const path = typeof file === 'string' ? file : file.path;

    // Проверка на дубликат (окно с таким путём уже открыто)
    if (!options.isForce) {
        const idWindow = hasPath(path);
        if (idWindow !== false) {
            focus(idWindow);
            return null;
        }
    }

    // Генерируем уникальный ID
    const id = useGetId();

    // Начальные границы (будут установлены в useSetFullscreenObserver)
    const calculated: WindowBounds = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    };

    const target: WindowBounds = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    };

    // Начальные состояния (пустые)
    const states: WindowStates = {};

    const realFile = typeof file === 'string' ? null : file;

    const windowOb: WindowOb = {
        id,
        bounds: {
            target,
            calculated,
        },
        states,
        targetFile: {
            value: path,
        },
        file: realFile,
    };

    // Регистрируем окно в глобальном хранилище
    allWindows.value[id] = windowOb;

    // Фокусируем новое окно
    focus(windowOb.id);
    return windowOb;
}
