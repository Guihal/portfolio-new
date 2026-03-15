import type { WindowOb } from '../Window';
import { useOnFullscreen } from './useOnFullScreen';

/**
 * Устанавливает fullscreen при монтировании окна.
 *
 * Логика:
 * 1. При монтировании — сразу включает fullscreen
 * 2. После монтирования — следит за changes contentArea и обновляет fullscreen
 *
 * @param windowOb - Объект окна
 */
export function useSetFullscreenObserver(windowOb: WindowOb) {
    const { contentArea } = useContentArea();

    // Флаг: окно ещё не смонтировано (для принудительной установки fullscreen)
    let isMounted = false;

    // Chained watcher: при изменении contentArea обновляет fullscreen размеры
    useSetChainedWatchers(
        () => windowOb.states.fullscreen === true,
        contentArea,
        () => {
            useOnFullscreen(windowOb, !isMounted);
        },
        {
            immediate: true,
        },
    );

    onMounted(() => {
        // Принудительно включаем fullscreen при монтировании
        windowOb.states.fullscreen = true;
        delete windowOb.states['fullscreen-ready'];

        // Через 100ms помечаем как смонтированное
        setTimeout(() => {
            isMounted = true;
        }, 100);
    });
}
