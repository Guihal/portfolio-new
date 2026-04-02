import { OFFSET } from '~/utils/constants/OFFSET';
import type { WindowOb } from '../Window';
import { getTargetBounds } from '~/composables/useWindowBounds';

/**
 * Composable для перетаскивания окна за заголовок.
 *
 * Логика:
 * 1. При pointerdown на заголовке — начинает перетаскивание
 * 2. Отслеживает pointermove — обновляет bounds.target.top/left
 * 3. Проверяет выход за границы (isOutOfBounds) — устанавливает fullscreen-ready
 * 4. При pointerup — если fullscreen-ready, включает fullscreen
 *
 * @param windowOb - Объект окна
 * @returns Обработчик pointerdown для заголовка
 */
export function useMove(windowOb: WindowOb) {
    // Последняя зафиксированная позиция курсора
    const lastX = ref(0);
    const lastY = ref(0);

    const { contentArea } = useContentArea();
    const { focus } = useFocusWindowController();
    const target = getTargetBounds(windowOb.id);

    /**
     * Проверяет, вышла ли позиция за пределы рабочей области.
     * Использует OFFSET для создания "мёртвой зоны" у краёв.
     */
    const isOutOfBounds = () => {
        return (
            lastX.value < OFFSET ||
            lastY.value < OFFSET ||
            lastX.value > contentArea.value.width - OFFSET * 2 ||
            lastY.value > contentArea.value.height - OFFSET * 2
        );
    };

    // Вызывается при изменении позиции — проверяет выход за границы
    const callback = () => {
        if (isOutOfBounds()) {
            // Окно у края — готово к переходу в fullscreen
            windowOb.states['fullscreen-ready'] = true;
        } else {
            delete windowOb.states['fullscreen-ready'];
        }
    };

    // Следим за позицией — сразу проверяем выход за границы
    watch(lastX, callback, {
        immediate: true,
    });

    watch(lastY, callback, {
        immediate: true,
    });

    // Возвращаем обработчик pointerdown
    return (ev: PointerEvent) => {
        // Если уже в fullscreen — перетаскивание запрещено
        if (windowOb.states.fullscreen) return;
        focus(windowOb.id);
        windowOb.states.drag = true;

        // Запоминаем начальную позицию
        lastY.value = ev.clientY;
        lastX.value = ev.clientX;

        // Обработчик перемещения
        const pointerMove = (ev: PointerEvent) => {
            // Вычисляем дельту перемещения
            const deltaY = ev.clientY - lastY.value;
            const deltaX = ev.clientX - lastX.value;

            // Обновляем последнюю позицию
            lastY.value = ev.clientY;
            lastX.value = ev.clientX;

            // Применяем дельту к позиции окна
            target.top += deltaY;
            target.left += deltaX;
        };

        // Обработчик отпускания
        const pointerup = (ev: PointerEvent) => {
            lastY.value = ev.clientY;
            lastX.value = ev.clientX;

            // Снимаем флаг перетаскивания
            delete windowOb.states.drag;

            // Очищаем слушатели
            document.removeEventListener('pointermove', pointerMove);
            document.removeEventListener('pointerup', pointerup);

            // Если было fullscreen-ready — включаем fullscreen
            if (windowOb.states['fullscreen-ready']) {
                windowOb.states.fullscreen = true;
            }

            delete windowOb.states['fullscreen-ready'];
        };

        document.addEventListener('pointermove', pointerMove);
        document.addEventListener('pointerup', pointerup);
    };
}
