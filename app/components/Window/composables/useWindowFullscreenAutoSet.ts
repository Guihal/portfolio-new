import type { WindowOb } from '../Window';
import { OFFSET } from '~/utils/constants/OFFSET';

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
    const { contentArea } = useContentArea();

    /**
     * Проверяет, вышло ли окно за границы рабочей области.
     * Использует OFFSET для создания "мёртвой зоны" у краёв.
     */
    const isOutOfBounds = () => {
        const bounds = windowOb.bounds.target;
        return (
            bounds.left < OFFSET ||
            bounds.top < OFFSET ||
            bounds.left + bounds.width > contentArea.value.width - OFFSET ||
            bounds.top + bounds.height > contentArea.value.height - OFFSET
        );
    };

    // Chained watcher: следит за bounds только во время drag
    useSetChainedWatchers(
        () => windowOb.states.drag === true,
        () => windowOb.bounds.target,
        () => {
            if (isOutOfBounds()) {
                windowOb.states['fullscreen-ready'] = true;
            } else {
                delete windowOb.states['fullscreen-ready'];
            }
        },
    );

    // Watcher завершения drag — включает fullscreen с задержкой
    watch(
        () => windowOb.states.drag === true,
        (v) => {
            // Если drag завершился (v = false)
            if (!v)
                setTimeout(() => {
                    // Если было fullscreen-ready — включаем fullscreen
                    if (windowOb.states['fullscreen-ready'])
                        windowOb.states['fullscreen'] = true;
                    delete windowOb.states['fullscreen-ready'];
                }, 10);
        },
        {
            immediate: true,
        },
    );
}
