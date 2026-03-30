export const MAX_SIZE = 150;

let scale: Ref<number> | null = null;
let scaledWidth: Ref<number> | null = null;
let scaledHeight: Ref<number> | null = null;

export function useScale() {
    if (!scale) {
        const { contentArea } = useContentArea();

        scale = computed(
            () =>
                MAX_SIZE /
                Math.max(contentArea.value.width, contentArea.value.height),
        );

        scaledWidth = computed(() => contentArea.value.width * scale!.value);
        scaledHeight = computed(() => contentArea.value.height * scale!.value);
    }

    return { scale, scaledWidth, scaledHeight } as {
        scale: Ref<number>;
        scaledWidth: Ref<number>;
        scaledHeight: Ref<number>;
    };
}
