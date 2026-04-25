// app/composables/useQueuedRouter.ts
// P1-09: очередь и флаги — client-only singletons. На SSR queuedPush — noop,
// т.к. QueueItem.resolve — функция (несериализуема) и pushQueue shared между юзерами в payload.
interface QueueItem {
	path: string;
	resolve: () => void;
}

const lastPushedPath: Ref<string | null> | null = import.meta.client
	? ref<string | null>(null)
	: null;
const pushQueue: Ref<QueueItem[]> | null = import.meta.client
	? ref<QueueItem[]>([])
	: null;
let isProcessing = false;

/**
 * Глобальная обёртка над router.push с очередью и дедупликацией.
 * - Если путь совпадает с последним запушенным - пропускает
 * - Гарантирует последовательную обработку
 * - Возвращает промис, который резолвится когда путь обработан
 */
export function useQueuedRouter() {
	const router = useRouter();
	const route = useRoute();

	const isQueueEmpty = computed(() =>
		pushQueue ? pushQueue.value.length === 0 : true,
	);

	const processQueue = async () => {
		if (!pushQueue || !lastPushedPath) return;
		if (isProcessing || pushQueue.value.length === 0) return;

		isProcessing = true;
		const item = pushQueue.value.shift();
		if (!item) {
			isProcessing = false;
			return;
		}

		try {
			if (item.path !== lastPushedPath.value && item.path !== route.path) {
				lastPushedPath.value = item.path;
				await router.push(item.path);
			}
		} finally {
			item.resolve();
			isProcessing = false;

			if (pushQueue.value.length > 0) {
				processQueue();
			}
		}
	};

	const queuedPush = (path: string): Promise<void> => {
		if (!pushQueue) return Promise.resolve();
		return new Promise((resolve) => {
			pushQueue.value.push({ path, resolve });
			processQueue();
		});
	};

	return {
		queuedPush,
		lastPushedPath,
		pushQueue,
		isQueueEmpty,
	};
}
