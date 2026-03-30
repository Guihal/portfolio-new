export const useResizeObserver = (
    element: Ref<HTMLElement | null>,
    callback: () => void,
) => {
    let observer: undefined | ResizeObserver;

    const create = () => {
        if (observer || !element.value) return;
        callback();
        observer = new ResizeObserver(callback);
        observer.observe(element.value);
    };

    const destroy = () => {
        if (!observer) return;
        observer.disconnect();
        observer = undefined;
    };

    watch(
        element,
        () => {
            if (!element.value) {
                destroy();
            } else {
                create();
            }
        },
        {
            immediate: true,
        },
    );
};
