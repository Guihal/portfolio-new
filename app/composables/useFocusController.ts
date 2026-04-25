import { storeToRefs } from "pinia";
import type { WindowOb } from "~/components/Window/types";
import { useFocusStore } from "~/stores/focus";

export const useFocusedWindowId = (): Ref<null | string> =>
	storeToRefs(useFocusStore()).focusedId;

export function useFocusWindowController() {
	const store = useFocusStore();
	const { queuedPush } = useQueuedRouter();

	return {
		focus: (id: string) => store.focus(id),
		unFocus: () => {
			store.unFocus();
			queuedPush("/");
		},
		getIsFocusedState: (windowOb: WindowOb) => store.isFocused(windowOb.id),
	};
}
