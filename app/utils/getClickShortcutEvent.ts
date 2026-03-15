/**
 * Обработчик клика с поддержкой double-click.
 *
 * Логика:
 * - На мобильных — сразу вызывает callback (нет double-click)
 * - На десктопе — ждёт второго клика в течение 400ms
 *
 * @param callback - Функция, вызываемая при double-click (или single на мобильных)
 * @returns Обработчик MouseEvent
 */
export const getClickShortcutEvent = (callback: () => void) => {
    const isMobile = useIsMobile();
    const TIMEOUTTIME = 400; // Время ожидания второго клика (мс)

    let timeout: any = null;
    let clicksCounter = 0;

    // Обработка второго клика
    const onDoubleClick = () => {
        clicksCounter++;

        if (clicksCounter < 2) {
            // Первый клик — ждём второй
            timeout = setTimeout(() => {
                clicksCounter = 0;
            }, TIMEOUTTIME);
            return;
        }

        // Второй клик — вызываем callback
        callback();
        clicksCounter = 0;
    };

    // Главный обработчик клика
    const click = () => {
        if (isMobile) {
            // На мобильных — сразу вызываем callback
            callback();
            return;
        }

        // Сбрасываем предыдущий таймаут
        clearTimeout(timeout);
        onDoubleClick();
    };

    return (ev: MouseEvent) => {
        ev.preventDefault();
        click();
    };
};
