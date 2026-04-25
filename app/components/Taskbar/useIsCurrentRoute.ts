export function useIsCurrentRoute(checkedRoute: Ref<string>) {
	const { allWindows } = useAllWindows();
	const isCurrentRoute = ref(false);
	const callback = () => {
		for (const key in allWindows.value) {
			const typedKey = key as keyof AllWindows;
			if (allWindows.value[typedKey]?.file?.path === checkedRoute.value) {
				isCurrentRoute.value = true;
				return;
			}
		}

		isCurrentRoute.value = false;
	};

	// Single initial compute — избегаем двойного fire на mount от immediate:true на обоих watch.
	callback();
	watch(checkedRoute, callback);
	watch(allWindows.value, callback);

	return {
		isCurrentRoute,
	};
}
