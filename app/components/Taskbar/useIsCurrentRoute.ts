import { storeToRefs } from "pinia";
import { useWindowsStore } from "~/stores/windows";

export function useIsCurrentRoute(checkedRoute: Ref<string>) {
	const { windows: allWindows } = storeToRefs(useWindowsStore());
	const isCurrentRoute = ref(false);
	const callback = () => {
		for (const key in allWindows.value) {
			if (allWindows.value[key]?.file?.path === checkedRoute.value) {
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
