// P8-05 — slider state: current index, total, disabled arrows, nav methods.

export function useSliderState(images: Ref<string[]>) {
	const current = ref(0);
	const total = computed(() => images.value.length);

	const prevDisabled = computed(() => current.value === 0 || total.value === 0);
	const nextDisabled = computed(
		() => total.value === 0 || current.value >= total.value - 1,
	);

	function next(): void {
		if (nextDisabled.value) return;
		current.value++;
	}

	function prev(): void {
		if (prevDisabled.value) return;
		current.value--;
	}

	function goto(i: number): void {
		if (i < 0 || i >= total.value) return;
		current.value = i;
	}

	watch(
		() => images.value,
		() => {
			current.value = 0;
		},
		{ deep: true },
	);

	return {
		current: readonly(current),
		total: readonly(total),
		prevDisabled: readonly(prevDisabled),
		nextDisabled: readonly(nextDisabled),
		next,
		prev,
		goto,
	};
}
