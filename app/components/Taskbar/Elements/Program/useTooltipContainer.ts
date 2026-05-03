import { debounce } from "~/utils/debounce";

export function useTooltipContainer() {
	const container = ref<HTMLElement | null>(null);
	const containerBounds = ref<DOMRect | null>(null);

	const isShow = ref(false);

	const setShow = debounce((v: boolean) => (isShow.value = v), 16);
	const mouseover = () => setShow(true);
	const mouseout = () => setShow(false);

	watch(
		isShow,
		(v) => {
			if (!v || !container.value) return;
			containerBounds.value = container.value.getBoundingClientRect();
		},
		{
			immediate: true,
		},
	);

	return {
		mouseover,
		mouseout,
		container,
		containerBounds,
		isShow,
	};
}
