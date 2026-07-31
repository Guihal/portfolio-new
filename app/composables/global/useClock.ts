import { CLOCK_TICK_MS } from "~/utils/constants/timing";
import { type ClockParts, formatClock } from "~/utils/formatClock";

// Живые часы таскбара. Тонкая Vue-обёртка над formatClock: интервал стартует
// только на клиенте (onMounted), иначе SSR-время разъедется с клиентским.
export function useClock(): ComputedRef<ClockParts> {
	const now = ref(new Date());
	let intervalId: ReturnType<typeof setInterval> | null = null;

	onMounted(() => {
		intervalId = setInterval(() => {
			now.value = new Date();
		}, CLOCK_TICK_MS);
	});

	onUnmounted(() => {
		if (intervalId) clearInterval(intervalId);
	});

	return computed(() => formatClock(now.value));
}
