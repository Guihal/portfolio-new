import type { WindowOb } from '../Window';
import {
    getTargetBounds,
    type WindowBoundsKey,
} from '~/composables/useWindowBounds';

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
    const { unFocus } = useFocusWindowController();

    const beforeCollapsedBounds = ref<Record<WindowBoundsKey, number>>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    });

    const target = getTargetBounds(windowOb.id);

    watch(
        () => windowOb.states.collapsed === true,
        (value, lastValue) => {
            if (lastValue === false && value === true) {
                beforeCollapsedBounds.value = {
                    left: target.left,
                    top: target.top,
                    width: target.width,
                    height: target.height,
                };
            }

            if (value === false) {
                target.left = beforeCollapsedBounds.value.left;
                target.top = beforeCollapsedBounds.value.top;
                target.width = beforeCollapsedBounds.value.width;
                target.height = beforeCollapsedBounds.value.height;
            }

            console.log(
                value,
                lastValue,
                beforeCollapsedBounds.value,
                target.left,
            );
        },
        {
            immediate: true,
        },
    );

    useSetChainedWatchers(
        () => windowOb.states.collapsed === true,
        () => contentArea,
        () => {
            setTimeout(() => {
                if (windowOb.states.collapsed) {
                    target.top = contentArea.value.height * 1.5;
                }
            });
        },
        {
            immediate: true,
        },
    );

    // Функция сворачивания окна
    return () => {
        setTimeout(() => {
            unFocus();

            setTimeout(() => {
                windowOb.states.collapsed = true;

                delete windowOb.states.fullscreen;
                delete windowOb.states.resize;
                delete windowOb.states.drag;
            });
        });
    };
}
