import { useSetPath } from '~/components/Window/utils/setPath';
import type { WindowOb } from '~/components/Window/Window';

// Глобальное состояние: ID окна в фокусе
export const focusedWindowId: Ref<null | string> = ref(null);

/**
 * Контроллер фокуса окон.
 *
 * Предоставляет:
 * - focus(id) — установить фокус на окно
 * - unFocus() — снять фокус
 * - getIsFocusedState(windowOb) — computed для проверки состояния
 * - setDocumentEvent() — обработчик клика на документ для снятия фокуса
 */
export function useFocusWindowController() {
    /**
     * Снимает фокус с текущего окна.
     * @param ev - Если передано событие — проверяет, был ли клик вне окон
     */
    const unFocus = () => {
        focusedWindowId.value = null;
    };

    // Установить фокус на окно по ID
    const focus = (idWindow: string) => {
        focusedWindowId.value = idWindow;
    };

    /**
     * Создаёт computed для проверки состояния фокуса окна.
     * @param windowOb - Объект окна
     * @returns Computed<boolean> — true если окно в фокусе
     */
    const getIsFocusedState = (windowOb: WindowOb) => {
        return computed(() => windowOb.id === focusedWindowId.value);
    };

    /**
     * Устанавливает обработчик клика на документ.
     * При клике вне окон — снимает фокус и переходит на '/'.
     */
    const setDocumentEvent = () => {
        const router = useRouter();
        const route = useRoute();
        onMounted(() => {
            document.addEventListener('click', (ev) => {
                const target = ev.target as HTMLElement;

                // Если клик по окну — ничего не делаем
                if (
                    target.closest(
                        `[id="window-${focusedWindowId.value}"], .taskbar__el, .loader`,
                    )
                ) {
                    return;
                }

                // Клик вне окон — снимаем фокус и переходим на главную
                focusedWindowId.value = null;
                useSetPath('/', router, route);
            });
        });

        watch(
            () => route.path,
            () => {
                if (route.path === '/') {
                    focusedWindowId.value = null;
                }
            },
        );
    };

    return { setDocumentEvent, focus, unFocus, getIsFocusedState };
}
