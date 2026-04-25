import { storeToRefs } from "pinia";
import { useQueuedRouter } from "~/composables/useQueuedRouter";
import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import { useFocusStore } from "~/stores/focus";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";

/**
 * Composable для сворачивания окна.
 *
 * Логика:
 * 1. При установке states.collapsed — перемещает окно вниз за пределы видимости
 * 2. Удаляет состояния fullscreen/resize/drag (они несовместимы со сворачиванием)
 *
 * @param windowOb - Объект окна
 * @returns Функция для сворачивания окна
 */
export function useCollapsed(windowOb: WindowOb) {
	const { area: contentArea } = storeToRefs(useContentAreaStore());
	const focusStore = useFocusStore();
	const windowsStore = useWindowsStore();
	const { queuedPush } = useQueuedRouter();

	const beforeCollapsedBounds = ref<Record<WindowBoundsKey, number>>({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
	});

	const target = useBoundsStore().ensure(windowOb.id).target;

	watch(
		() => windowOb.states.collapsed === true,
		(value, lastValue) => {
			if (lastValue === false && value === true) {
				beforeCollapsedBounds.value = {
					left: target.left,
					top: target.top,
					width: target.width,
					height: target.height,
				};
			}

			if (value === false) {
				target.left = beforeCollapsedBounds.value.left;
				target.top = beforeCollapsedBounds.value.top;
				target.width = beforeCollapsedBounds.value.width;
				target.height = beforeCollapsedBounds.value.height;
			}
		},
		{
			immediate: true,
		},
	);

	let collapseMoveTimer: ReturnType<typeof setTimeout> | null = null;
	useSetChainedWatchers(
		() => windowOb.states.collapsed === true,
		() => contentArea,
		() => {
			if (collapseMoveTimer !== null) clearTimeout(collapseMoveTimer);
			collapseMoveTimer = setTimeout(() => {
				collapseMoveTimer = null;
				if (windowOb.states.collapsed) {
					target.top = contentArea.value.height * 1.5;
				}
			});
		},
		{
			immediate: true,
		},
	);

	// Функция сворачивания окна (idempotent: двойной клик до завершения — ignored)
	let collapseOuterTimer: ReturnType<typeof setTimeout> | null = null;
	let collapseInnerTimer: ReturnType<typeof setTimeout> | null = null;
	let collapsePending = false;

	const triggerCollapse = () => {
		if (collapsePending) return;
		collapsePending = true;

		// Safety clear (paranoia): при ненарушенном инварианте timer уже null.
		if (collapseOuterTimer !== null) clearTimeout(collapseOuterTimer);
		collapseOuterTimer = setTimeout(() => {
			collapseOuterTimer = null;
			focusStore.unFocus();
			queuedPush("/");

			if (collapseInnerTimer !== null) clearTimeout(collapseInnerTimer);
			collapseInnerTimer = setTimeout(() => {
				collapseInnerTimer = null;
				// setState 'collapsed' автоматически clear fullscreen/drag/resize
				// через INCOMPATIBLE table в windows store.
				windowsStore.setState(windowOb.id, "collapsed", true);
				collapsePending = false;
			});
		});
	};

	onScopeDispose(() => {
		if (collapseMoveTimer !== null) {
			clearTimeout(collapseMoveTimer);
			collapseMoveTimer = null;
		}
		if (collapseOuterTimer !== null) {
			clearTimeout(collapseOuterTimer);
			collapseOuterTimer = null;
		}
		if (collapseInnerTimer !== null) {
			clearTimeout(collapseInnerTimer);
			collapseInnerTimer = null;
		}
	});

	return triggerCollapse;
}
