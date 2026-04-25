import type { WindowOb } from "~/components/Window/types";
import { useWindowsStore } from "~/stores/windows";
import { PROGRAMS } from "~/utils/constants/programs";
import type { ProgramType } from "~~/shared/types/filesystem";

export const useWindowsGroupByProgram = () => {
	const store = useWindowsStore();

	const windowsGroupByProgram = computed<
		Partial<Record<ProgramType, WindowOb[]>>
	>(() => {
		const result: Partial<Record<ProgramType, WindowOb[]>> = {};

		for (const w of store.list) {
			if (!w?.file) continue;
			const t = w.file.programType;
			if (!PROGRAMS[t]) continue;
			const bucket = result[t] ?? [];
			bucket.push(w);
			result[t] = bucket;
		}

		return result;
	});

	return { windowsGroupByProgram };
};
