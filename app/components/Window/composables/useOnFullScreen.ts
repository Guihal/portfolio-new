import type { WindowBounds, WindowOb } from '../Window';

/**
 * Устанавливает размеры окна на всю контентную область (fullscreen).
 *
 * @param windowOb - Объект окна
 * @param isForce - Если true, синхронизирует calculated с target (для мгновенной установки без анимации)
 */
export function useOnFullscreen(windowOb: WindowOb, isForce = false) {
    const { contentArea } = useContentArea();

    /**
     * Устанавливает значение свойства.
     * Если isForce — также обновляет calculated для мгновенного перехода.
     */
    const set = (prop: keyof WindowBounds, value: number) => {
        windowOb.bounds.target[prop] = value;
        if (isForce) {
            // Синхронизием calculated с target для мгновенной установки
            windowOb.bounds.calculated[prop] = value;
        }
    };

    // Устанавливаем fullscreen размеры (0, 0, full width, full height)
    set('left', 0);
    set('top', 0);
    set('width', contentArea.value.width);
    set('height', contentArea.value.height);
}
