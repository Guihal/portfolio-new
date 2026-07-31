import { useCreateAndRegisterWindow } from "~/components/Window/composables/lifecycle/useCreateAndRegisterWindow";
import { useTooltipState } from "~/composables/window/useTooltipState";
import { getProgram } from "~/programs";
import { useFocusStore } from "~/stores/focus";
import type { TaskbarItem } from "../../useTaskbarItems";

// Логика элемента таскбара: одна кнопка обслуживает и закреплённую программу,
// и запущенную. Вынесена из SFC — иначе <script> вылезает за лимит 80 LOC.
export function useTaskbarElement(
	item: () => TaskbarItem,
	container: Ref<HTMLElement | null>,
) {
	const focusStore = useFocusStore();
	const { register, unregister, setContainer, show, hide, updateWindowObs } =
		useTooltipState();

	const icon = computed(() => getProgram(item().type)?.icon ?? "");
	const isRunning = computed(() => item().windows.length > 0);
	// focusedId читаем напрямую: isFocused(id) в render создаёт computed на каждый рендер.
	const isActive = computed(() =>
		item().windows.some((w) => w.id === focusStore.focusedId),
	);
	const tag = computed(() => (item().path ? "a" : "button"));

	const currentIndex = ref(0);

	onMounted(() => {
		register(item().type, item().windows);
		setContainer(item().type, container.value);
	});

	onBeforeUnmount(() => unregister(item().type));

	watch(
		() => item().windows,
		(windows) => {
			updateWindowObs(item().type, windows);
			if (windows.length === 0) hide(item().type);
		},
	);

	watch(currentIndex, () => {
		const windows = item().windows;
		if (currentIndex.value > windows.length - 1) {
			currentIndex.value = 0;
			return;
		}

		const windowOb = windows[currentIndex.value];
		if (!windowOb) return;

		focusStore.focus(windowOb.id);
	});

	const onClick = (ev: MouseEvent) => {
		// tag="a": без preventDefault браузер уходит по href → полная перезагрузка.
		ev.preventDefault();

		if (item().windows.length > 0) {
			currentIndex.value++;
			return;
		}

		const path = item().path;
		if (path) setTimeout(() => useCreateAndRegisterWindow(path));
	};

	const onMouseenter = () => {
		if (isRunning.value) show(item().type);
	};
	const onMouseleave = () => hide(item().type);

	return {
		icon,
		isActive,
		isRunning,
		tag,
		onClick,
		onMouseenter,
		onMouseleave,
	};
}
