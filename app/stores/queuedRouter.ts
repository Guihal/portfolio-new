import { defineStore } from "pinia";
import { computed, ref } from "vue";

interface QueueItem {
	path: string;
	resolve: () => void;
}

/**
 * Глобальная обёртка над router.push с очередью и дедупликацией.
 *
 * Дедуп: игнорируем push если path совпадает с lastPushedPath (сейчас в работе)
 * или с path последнего элемента в очереди — тогда сразу резолвим.
 *
 * Очередь — плоский массив (не Ref<Array>), реактивность не нужна для логики.
 * `lastPushedPath` / `isProcessing` — refs для readable экспонирования наружу.
 */
export const useQueuedRouterStore = defineStore("queuedRouter", () => {
	const lastPushedPath = ref<string | null>(null);
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
			if (item.path !== lastPushedPath.value) {
				lastPushedPath.value = item.path;
				const router = useRouter();
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
		const last = queue[queue.length - 1];
		if (path === lastPushedPath.value || (last && last.path === path)) {
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
		lastPushedPath.value = null;
	}

	return {
		lastPushedPath,
		isProcessing,
		isEmpty,
		queue: queueRef,
		push,
		$reset,
	};
});
