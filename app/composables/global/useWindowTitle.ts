import { getProgram } from "~/programs";

export function useWindowTitle(file: Ref<FsFile | null>) {
	const separator = " - ";

	const label = computed(() => {
		if (!file.value) return "";
		return getProgram(file.value.programType)?.label ?? "";
	});

	const name = computed(() => {
		if (!file.value) return "";
		return file.value.name ?? "";
	});

	const title = computed(() => {
		const parts = [label.value, name.value].filter(Boolean);
		return parts.join(separator);
	});

	return {
		label,
		name,
		title,
	};
}
