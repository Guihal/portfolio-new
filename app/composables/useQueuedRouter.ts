// app/composables/useQueuedRouter.ts
const lastPushedPath = ref<string | null>(null);

interface QueueItem {
    path: string;
    resolve: () => void;
}

const pushQueue = ref<QueueItem[]>([]);
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

    const isQueueEmpty = computed(() => pushQueue.value.length === 0);

    const processQueue = async () => {
        if (isProcessing || pushQueue.value.length === 0) return;

        isProcessing = true;
        const item = pushQueue.value.shift()!;

        try {
            // Дедупликация: не пушить если тот же путь
            if (
                item.path !== lastPushedPath.value &&
                item.path !== route.path
            ) {
                lastPushedPath.value = item.path;
                await router.push(item.path);
            }
        } finally {
            // Резолвим промис вызывающей стороны
            item.resolve();
            isProcessing = false;

            // Обрабатываем следующий в очереди
            if (pushQueue.value.length > 0) {
                processQueue();
            }
        }
    };

    const queuedPush = (path: string): Promise<void> => {
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
