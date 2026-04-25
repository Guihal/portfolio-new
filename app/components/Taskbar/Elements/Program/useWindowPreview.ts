import { computed, ref, watch } from 'vue';
import type { WindowOb } from '~/components/Window/types';
import { useFrameStore } from '~/stores/frame';
import { useWindowsStore } from '~/stores/windows';

const PLACEHOLDER_IMG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export function useWindowPreview(windowOb: WindowOb) {
    const frameStore = useFrameStore();
    const windowsStore = useWindowsStore();

    const srcRaw = computed(() => frameStore.images[windowOb.id] ?? '');
    const lastNonEmpty = ref<string>(srcRaw.value);
    watch(srcRaw, (v) => {
        if (v) lastNonEmpty.value = v;
    });
    const src = computed(() => lastNonEmpty.value || PLACEHOLDER_IMG);

    const onPreview = () => {
        windowsStore.setState(windowOb.id, 'preview', true);
    };
    const offPreview = () => {
        windowsStore.clearState(windowOb.id, 'preview');
    };

    return { src, onPreview, offPreview };
}
