// Размеры viewport (всего окна браузера)
const viewport = ref({ width: 0, height: 0 });

// Высота taskbar (панели задач)
const taskbarHeight = ref(0);

export type ContentAreaObj = {
    width: number;
    height: number;
};

export type ContentArea = Ref<ContentAreaObj>;

/**
 * Вычисляемая рабочая область.
 * = viewport - taskbar (область, доступная для окон)
 */
const contentArea: ContentArea = computed(() => ({
    width: viewport.value.width,
    height: viewport.value.height - taskbarHeight.value,
}));

// Флаг инициализации viewport observer (для предотвращения дублирования)
let setViewportObserverInitialised = false;

/**
 * Подписывается на изменения размера viewport через ResizeObserver.
 * Обновляет viewport.width/height при изменении размера окна браузера.
 */
const setViewportObserver = () => {
    if (setViewportObserverInitialised) return;
    setViewportObserverInitialised = true;

    onMounted(() => {
        const element = document.documentElement;
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (!rect) return;

            viewport.value.width = rect.width;
            viewport.value.height = rect.height;
        });

        observer.observe(element);

        onBeforeUnmount(() => observer.disconnect());
    });
};

// Флаг инициализации taskbar observer
let setTaskbarObserverInitialised = false;

/**
 * Подписывается на изменения размера taskbar.
 * Обновляет taskbarHeight при изменении высоты панели задач.
 *
 * @param elementRef - Ref на элемент taskbar
 */
const setTaskbarObserver = (elementRef: Ref<HTMLElement | null>) => {
    if (setTaskbarObserverInitialised) return;
    setTaskbarObserverInitialised = true;

    onMounted(() => {
        if (!elementRef.value) return;

        const observer = new ResizeObserver((entries) => {
            const height = entries[0]?.contentRect.height;
            if (height === undefined) return;
            taskbarHeight.value = height;
        });

        observer.observe(elementRef.value);
        onBeforeUnmount(() => observer.disconnect());
    });
};

/**
 * Composable для работы с рабочей областью.
 *
 * @returns contentArea — вычисляемая рабочая область
 * @returns setTaskbarObserver — функция для подписки на taskbar
 * @returns setViewportObserver — функция для подписки на viewport
 */
export const useContentArea = () => {
    return { contentArea, setTaskbarObserver, setViewportObserver };
};
