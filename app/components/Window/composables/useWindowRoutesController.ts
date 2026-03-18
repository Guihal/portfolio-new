import { useSetPath } from '../utils/setPath';
import type { WindowOb } from '../Window';
import { useWindowLoading } from './useWindowLoading';

export async function useWindowRoutesController(windowOb: WindowOb) {
    const router = useRouter();
    const route = useRoute();
    const { focus, unFocus } = useFocusWindowController();
    const { register } = useWindowLoading();

    onBeforeUnmount(() => {
        unFocus();
        useSetPath('/', router, route);
    });

    watch(
        () => route.path,
        () => {
            if (route.path === windowOb.targetFile) {
                useSetPath(route.path, router, route);
                focus(windowOb.id);
                return;
            }
        },
    );

    useSetChainedWatchers(
        () => windowOb.states.focused === true,
        () => route.path,
        () => {
            if (route.path === '/') {
                return;
            }

            if (
                route.path.startsWith(windowOb.targetFile) ||
                windowOb.targetFile.startsWith(route.path)
            ) {
                windowOb.targetFile = route.path;
                useSetPath(route.path, router, route);
            }
        },
        {
            immediate: true,
        },
    );

    watch(
        () => windowOb.states.focused === true,
        (v) => {
            if (v) {
                useSetPath(windowOb.targetFile, router, route);
            }
        },
        {
            immediate: true,
        },
    );

    const { data, pending, refresh } = await useAsyncData(
        () => `window-entity-${windowOb.targetFile}`,
        async () => {
            const entity = await $fetch('/api/filesystem/get', {
                responseType: 'json',
                method: 'POST',
                body: {
                    path: windowOb.targetFile,
                },
            });

            return entity;
        },
        {
            lazy: import.meta.server ? false : true,
        },
    );

    if (data.value) {
        console.log(data.value);
        windowOb.file = { path: windowOb.targetFile, ...data.value };
    }

    // для клиентской навигации — смена targetFile
    watch(
        () => windowOb.targetFile,
        async () => {
            if (windowOb.states.focused) {
                useSetPath(windowOb.targetFile, router, route);
            }

            if (
                windowOb.file === null ||
                windowOb.targetFile !== windowOb.file.path
            ) {
                await refresh();
            }
        },
        {
            immediate: true,
        },
    );

    register(windowOb.id, pending);

    watch(data, () => {
        if (!data.value) {
            windowOb.file = null;
            return;
        }

        windowOb.file = { path: windowOb.targetFile, ...data.value };
    });
}
