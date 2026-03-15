import type { WindowOb } from '../Window';

/**
 * Composable для сворачивания окна.
 *
 * Логика:
 * 1. При установке states.collapsed — перемещает окно вниз за пределы видимости
 * 2. Удаляет состояния fullscreen/resize/drag (они несовместимы со сворачиванием)
 *
 * @param windowOb - Объект окна
 * @returns Функция для сворачивания окна
 */
export function useCollapsed(windowOb: WindowOb) {
    const { contentArea } = useContentArea();

    // Chained watcher: при изменении contentArea обновляет позицию свёрнутого окна
    useSetChainedWatchers(
        () => windowOb.states.collapsed === true,
        () => contentArea,
        () => {
            // Перемещаем окно вниз за пределы видимости (в 1.5 раза ниже контента)
            windowOb.bounds.target.top = contentArea.value.height * 1.5;
            windowOb.bounds.target.left = 0;
        },
        {
            immediate: true,
        },
    );

    // Функция сворачивания окна
    return () => {
        windowOb.states.collapsed = true;
        // Удаляем несовместимые состояния
        delete windowOb.states.fullscreen;
        delete windowOb.states.resize;
        delete windowOb.states.drag;
    };
}
