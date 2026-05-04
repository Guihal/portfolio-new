import { defineStore } from "pinia";
import { computed, ref } from "vue";

interface QueueItem {
	path: string;
	resolve: () => void;
}

/**
 * Глобальная обёртка над router.push с очередью и дедупликацией.
 *
 * Дедуп: игнорируем push если path совпадает с последним элементом в очереди
 * или с текущим route.path — тогда сразу резолвим.
 *
 * Очередь — плоский массив (не Ref<Array>), реактивность не нужна для логики.
 * `isProcessing` — ref для readable экспонирования наружу.
 */
export const useQueuedRouterStore = defineStore("queuedRouter", () => {
	const isProcessing = ref(false);
	const queueLength = ref(0);
	const queue: QueueItem[] = [];

	const isEmpty = computed(() => queueLength.value === 0);
	const queueRef = computed(() => queue);

	const processQueue = async () => {
		if (isProcessing.value) return;
		const item = queue.shift();
		if (!item) return;
		queueLength.value = queue.length;

		isProcessing.value = true;
		try {
			const router = useRouter();
			if (item.path !== router.currentRoute.value.path) {
				await router.push(item.path);
			}
		} finally {
			item.resolve();
			isProcessing.value = false;
			if (queue.length > 0) {
				processQueue();
			}
		}
	};

	const push = (path: string): Promise<void> => {
		const router = useRouter();
		if (path === router.currentRoute.value.path) {
			return Promise.resolve();
		}
		const last = queue[queue.length - 1];
		if (last && last.path === path) {
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			queue.push({ path, resolve });
			queueLength.value = queue.length;
			processQueue();
		});
	};

	/**
	 * Замыканный `queue` array тоже должен быть очищен — иначе ghost-pushes
	 * между SSR-запросами на одном Vercel function instance.
	 */
	function $reset() {
		queue.length = 0;
		queueLength.value = 0;
		isProcessing.value = false;
	}

	return {
		isProcessing,
		isEmpty,
		queue: queueRef,
		push,
		$reset,
	};
});
