import type { WindowOb } from '~/components/Window/Window';
import { debounce } from '~/components/Window/utils/debounce';
import { getCalculatedBounds } from '~/composables/useWindowBounds';
import * as htmlToImage from 'html-to-image';

const images = reactive<Record<string, string>>({});
const observers = new Map<string, MutationObserver>();

export const useFrameObserver = () => {
    const createObserver = (windowOb: WindowOb) => {
        if (observers.has(windowOb.id)) return;

        const el = document.getElementById(`window-${windowOb.id}`);
        if (!el) return;
        const wrapper = el.querySelector<HTMLElement>('.window__wrapper');
        if (!wrapper) return;

        const calculated = getCalculatedBounds(windowOb.id);

        const generateImage = debounce(async () => {
            console.log(`Generating image for window ${windowOb.id}`);
            try {
                images[windowOb.id] = await htmlToImage.toJpeg(wrapper, {
                    width: calculated.width,
                    height: calculated.height,
                    cacheBust: true,
                    quality: 1,
                });
            } catch {
                // html-to-image может падать на невидимых элементах
            }
        }, 300);

        const observer = new MutationObserver(() => generateImage());

        observer.observe(el, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });

        observers.set(windowOb.id, observer);

        // Генерируем первое изображение сразу
        generateImage();
    };

    const destroyObserver = (windowId: string) => {
        const observer = observers.get(windowId);
        if (observer) {
            observer.disconnect();
            observers.delete(windowId);
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete images[windowId];
    };

    const getSrc = (windowId: string) => computed(() => images[windowId] ?? '');

    return { createObserver, destroyObserver, getSrc };
};
