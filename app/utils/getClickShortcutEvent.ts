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
	let lock = false;

	return (ev: MouseEvent) => {
		ev.preventDefault();
		if (lock) return;
		lock = true;
		callback();
		setTimeout(() => {
			lock = false;
		}, 300);
	};
};
