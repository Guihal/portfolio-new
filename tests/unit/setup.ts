// P0-06: глобалы Nitro для импорта server/utils в unit-тестах.

import { vi } from "vitest";
import {
	computed,
	inject,
	onMounted,
	onScopeDispose,
	onUnmounted,
	provide,
	ref,
	shallowRef,
	watch,
	watchEffect,
} from "vue";

(globalThis as any).useStorage = () => ({
	getItem: async () => null,
});

(globalThis as any).createError = (e: {
	statusCode?: number;
	statusMessage?: string;
}) => {
	const err = new Error(e.statusMessage ?? "error");
	(err as any).statusCode = e.statusCode;
	return err;
};

(globalThis as any).defineCachedFunction = (fn: any) => fn;
(globalThis as any).defineCachedEventHandler = (fn: any) => fn;

// Vue auto-imports — useFetchEntity и др. composables используют bare
// идентификаторы (Nuxt unimport на dev/build). В тестах подмешиваем в global.
Object.assign(globalThis, {
	computed,
	inject,
	onMounted,
	onScopeDispose,
	onUnmounted,
	provide,
	ref,
	shallowRef,
	watch,
	watchEffect,
});

// Nuxt auto-imports, нужные для useFetchEntity:
(globalThis as any).$fetch = vi.fn();

// useAsyncData stub. Контракт:
//   {data: Ref, error: Ref, refresh: () => Promise<void>, clear: () => void}.
// Тесты могут мутировать data.value/error.value напрямую — watch внутри
// composable триггерится Vue reactivity'й. Single-shot fetch (без watch[deps]
// автоперевыкупа) — для unit-тестов достаточно; refetch проверяется явным
// вызовом refresh() или повторным запуском composable.
(globalThis as any).useAsyncData = async (
	_key: any,
	fn: () => Promise<any> | any,
) => {
	const data = ref<any>(null);
	const error = ref<any>(null);
	try {
		data.value = await fn();
	} catch (e) {
		error.value = e;
	}
	return {
		data,
		error,
		refresh: async () => {
			try {
				data.value = await fn();
				error.value = null;
			} catch (e) {
				error.value = e;
			}
		},
		clear: () => {
			data.value = null;
			error.value = null;
		},
	};
};

(globalThis as any).clearNuxtData = vi.fn();

// Default no-op router stub. Тесты queuedRouter переопределяют локально
// (см. tests/unit/stores/queuedRouter.test.ts).
(globalThis as any).useRouter = () => ({
	push: async () => {},
});

export { vi };
