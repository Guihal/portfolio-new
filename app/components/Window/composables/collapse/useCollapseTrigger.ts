import { useFocusStore } from "~/stores/focus";
import { useQueuedRouterStore } from "~/stores/queuedRouter";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../../types";

/**
 * Возвращает функцию, инициирующую сворачивание окна.
 *
 * Sequenced setTimeout chain (preserve animation timing):
 * outer setTimeout → unFocus + router.push("/") → inner setTimeout →
 * setState collapsed=true. Idempotent через `pending` lock — двойной клик
 * до завершения последовательности игнорируется.
 *
 * Mutates: focus store (unFocus), queuedRouter (push), windows store (setState).
 */
export function useCollapseTrigger(windowOb: WindowOb): () => void {
	const focusStore = useFocusStore();
	const windowsStore = useWindowsStore();
	const queuedRouter = useQueuedRouterStore();

	let outerTimer: ReturnType<typeof setTimeout> | null = null;
	let innerTimer: ReturnType<typeof setTimeout> | null = null;
	let pending = false;

	const trigger = () => {
		if (pending) return;
		pending = true;

		// Safety clear (paranoia): при ненарушенном инварианте timer уже null.
		if (outerTimer !== null) clearTimeout(outerTimer);
		outerTimer = setTimeout(() => {
			outerTimer = null;
			focusStore.unFocus();
			queuedRouter.push("/");

			if (innerTimer !== null) clearTimeout(innerTimer);
			innerTimer = setTimeout(() => {
				innerTimer = null;
				// setState 'collapsed' автоматически clear fullscreen/drag/resize
				// через INCOMPATIBLE table в windows store.
				windowsStore.setState(windowOb.id, "collapsed", true);
				pending = false;
			});
		});
	};

	onScopeDispose(() => {
		if (outerTimer !== null) {
			clearTimeout(outerTimer);
			outerTimer = null;
		}
		if (innerTimer !== null) {
			clearTimeout(innerTimer);
			innerTimer = null;
		}
	});

	return trigger;
}
