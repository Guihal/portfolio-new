import type { WindowOb } from '../Window';
import { getTargetBounds } from '~/composables/useWindowBounds';
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
    const target = getTargetBounds(windowOb.id);

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
