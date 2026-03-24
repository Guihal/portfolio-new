import type { WindowOb } from '../Window';

export function useWindowRoute(windowOb: WindowOb) {
    const route = useRoute();

    const windowRoute = ref(windowOb.targetFile);

    const getTruthSource = () => {
        if (route.redirectedFrom?.path.includes(windowOb.file))
            return route.path;
    };

    useSetChainedWatchers(
        () => windowOb.states.focused === true,
        () => [route, windowOb.targetFile],
        () => {
            if (route.path === windowOb.targetFile.value) return;
        },
    );

    onBeforeUnmount(() => {});

    return computed(() => windowRoute.value);
}
