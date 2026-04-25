import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { WindowOb } from '~/components/Window/types';
import { useBoundsStore } from '~/stores/bounds';
import { useContentAreaStore } from '~/stores/contentArea';
import { useScale } from '../../useScale';

export function useTaskbarFramePosition(windowOb: WindowOb) {
    const { area: contentArea } = storeToRefs(useContentAreaStore());
    const { scale } = useScale();
    const calculated = useBoundsStore().ensure(windowOb.id).calculated;

    const frameWidth = computed(() => calculated.width * scale.value);
    const frameHeight = computed(() => calculated.height * scale.value);

    const frameLeft = computed(
        () =>
            Math.max(
                Math.min(
                    contentArea.value.width - calculated.width,
                    calculated.left,
                ),
                0,
            ) * scale.value,
    );

    const frameTop = computed(
        () =>
            Math.max(
                Math.min(
                    contentArea.value.height - calculated.height,
                    calculated.top,
                ),
                0,
            ) * scale.value,
    );

    return { frameWidth, frameHeight, frameLeft, frameTop };
}
