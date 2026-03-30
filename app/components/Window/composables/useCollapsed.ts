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
    const { unFocus } = useFocusWindowController();

    const beforeCollapsedBounds = ref({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    });

    watch(
        () => windowOb.states.collapsed === true,
        (value, lastValue) => {
            if (lastValue === false && value === true) {
                beforeCollapsedBounds.value = { ...windowOb.bounds.target };
            }

            if (value === false) {
                windowOb.bounds.target = { ...beforeCollapsedBounds.value };
            }

            console.log(
                value,
                lastValue,
                beforeCollapsedBounds.value,
                windowOb.bounds.target,
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
                    windowOb.bounds.target.top = contentArea.value.height * 1.5;
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
