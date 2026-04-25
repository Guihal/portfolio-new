// Client-only. SSR: все методы — no-op.
const loaders: Record<string, Ref<Ref<boolean>[]>> | null = import.meta.client
	? {}
	: null;

export function useWindowLoading() {
	const register = (windowId: string, isLoading: Ref<boolean>) => {
		if (!loaders) return;
		if (!loaders[windowId]) {
			loaders[windowId] = ref([]);
		}

		loaders[windowId].value.push(isLoading);
	};

	const unregister = (windowId: string) => {
		if (!loaders || !(windowId in loaders)) return;
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete loaders[windowId];
	};

	const isLoading = (windowId: string) => {
		if (!loaders) return false;
		return (
			loaders[windowId]?.value.some((ref) => (ref ? ref.value : false)) ?? false
		);
	};

	const getIsLoading = (windowId: string) =>
		computed(() => isLoading(windowId));

	const { allWindows } = useAllWindows();

	const initWindowLoading = (windowId: string) => {
		if (!loaders) return;
		if (!loaders[windowId]) {
			loaders[windowId] = ref([]); // ← создаём до watch
		}

		// Trailing-debounce 50ms через watchEffect+onCleanup:
		// effect ре-запускается на каждое изменение dep'ов (синхронные reads
		// регистрируют tracking); onCleanup отменяет pending setTimeout; новый
		// setTimeout ставится. Если deps меняются чаще 50ms — side-effect не
		// вызывается. После 50ms тишины — вызывается. Scope привязан к
		// компоненту, инициирующему initWindowLoading (Window/index.vue),
		// onScopeDispose стопает effect на unmount.
		watchEffect((onCleanup) => {
			const windowOb = allWindows.value[windowId];
			const windowLoaders = loaders[windowId];
			const loading = windowLoaders?.value.some((ref) => ref.value) ?? false;

			if (!windowOb) return;

			const timer = setTimeout(() => {
				if (loading) {
					windowOb.states.loading = true;
				} else {
					delete windowOb.states.loading;
				}
			}, 50);

			onCleanup(() => clearTimeout(timer));
		});
	};

	return {
		initWindowLoading,
		register,
		unregister,
		getIsLoading,
	};
}
