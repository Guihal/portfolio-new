import { storeToRefs } from "pinia";
import type { WindowOb } from "~/components/Window/types";
import { useWindowsStore } from "~/stores/windows";
import type { ProgramType } from "~~/shared/types/filesystem";

export type TaskbarItem = {
	type: ProgramType;
	/** Непустой только у закреплённых — точка входа для «открыть окно». */
	path: string | null;
	windows: WindowOb[];
};

// Закреплённые программы: порядок массива = порядок иконок слева.
// Добавить закреп = строка здесь, компоненты не трогаются.
const PINNED: { type: ProgramType; path: string }[] = [
	{ type: "about", path: "/about" },
];

// Один item на программу: закреплённая с открытым окном не удваивается,
// а получает свои окна — иначе pinned и running рендерятся дважды.
export function useTaskbarItems(): ComputedRef<TaskbarItem[]> {
	const { byProgramMap } = storeToRefs(useWindowsStore());

	return computed(() => {
		const items: TaskbarItem[] = PINNED.map((pin) => ({
			type: pin.type,
			path: pin.path,
			windows: byProgramMap.value.get(pin.type) ?? [],
		}));

		const pinnedTypes = new Set(PINNED.map((pin) => pin.type));

		for (const [type, windows] of byProgramMap.value) {
			if (pinnedTypes.has(type)) continue;
			items.push({ type, path: null, windows });
		}

		return items;
	});
}
