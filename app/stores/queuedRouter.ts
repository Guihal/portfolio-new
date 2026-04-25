import { defineStore } from "pinia";
import { computed, ref } from "vue";

interface QueueItem {
	path: string;
	resolve: () => void;
}

export const useQueuedRouterStore = defineStore("queuedRouter", () => {
	const lastPushedPath = ref<string | null>(null);
	const queue = ref<QueueItem[]>([]);
	const isProcessing = ref(false);
	const isEmpty = computed(() => queue.value.length === 0);

	// TODO P3-05: мигрировать useQueuedRouter сюда
	async function push(_path: string): Promise<void> {}

	return { lastPushedPath, queue, isProcessing, isEmpty, push };
});
