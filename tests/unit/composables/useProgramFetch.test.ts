import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, watch } from "vue";
import type { Breadcrumb, FsFile, FsList } from "~~/shared/types/filesystem";

// Mock FsClient — useProgramFetch обращается к нему для kind='list'/'breadcrumbs'.
// Для kind='get' — к useEntitiesStore, который сам вызывает FsClient.get.
vi.mock("~/services/filesystem", () => ({
	FsClient: {
		get: vi.fn(),
		list: vi.fn(),
		getBreadcrumbs: vi.fn(),
	},
	FsServerError: class FsServerError extends Error {
		readonly kind = "server" as const;
		readonly status?: number;
		constructor(message: string, status?: number) {
			super(message);
			this.name = "FsServerError";
			this.status = status;
		}
	},
	FsNotFoundError: class FsNotFoundError extends Error {
		readonly kind = "not-found" as const;
		constructor(path: string) {
			super(`not found: ${path}`);
			this.name = "FsNotFoundError";
		}
	},
	FsAbortedError: class FsAbortedError extends Error {
		readonly kind = "aborted" as const;
		constructor() {
			super("aborted");
			this.name = "FsAbortedError";
		}
	},
}));

import { useProgramFetch } from "~/composables/window/useProgramFetch";
import { FsClient, FsServerError } from "~/services/filesystem";
import { useEntitiesStore } from "~/stores/entities";

const makeFile = (path: string): FsFile => ({
	name: path.replace(/^\//, "") || "root",
	path,
	programType: "project",
});

// scope.run<T>() → T | undefined; в тестах гарантируем non-undefined через
// явный assert (избегаем noNonNullAssertion от biome).
async function runIn<T>(
	scope: ReturnType<typeof effectScope>,
	fn: () => Promise<T>,
): Promise<T> {
	const r = scope.run(fn);
	if (!r) throw new Error("scope.run returned undefined");
	return await r;
}

beforeEach(() => {
	setActivePinia(createPinia());
	vi.mocked(FsClient.get).mockReset();
	vi.mocked(FsClient.list).mockReset();
	vi.mocked(FsClient.getBreadcrumbs).mockReset();
});

describe("useProgramFetch — kind='get'", () => {
	it("идёт через entitiesStore: cache hit на втором вызове", async () => {
		vi.mocked(FsClient.get).mockResolvedValue(makeFile("/a"));

		const scope = effectScope();
		const { data: data1 } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "get" }),
		);
		expect(data1.value).toEqual(makeFile("/a"));
		expect(FsClient.get).toHaveBeenCalledTimes(1);

		// Второй composable instance с тем же pinia → cache hit, no extra get call.
		const { data: data2 } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "get" }),
		);
		expect(data2.value).toEqual(makeFile("/a"));
		expect(FsClient.get).toHaveBeenCalledTimes(1);

		scope.stop();
	});

	it("entitiesStore делит underlying FsClient.get для одного path", async () => {
		vi.mocked(FsClient.get).mockResolvedValue(makeFile("/x"));

		const store = useEntitiesStore();
		const a = await store.fetch("/x");
		const b = await store.fetch("/x");
		expect(a).toBe(b);
		expect(FsClient.get).toHaveBeenCalledTimes(1);
	});
});

describe("useProgramFetch — kind='list'", () => {
	it("вызывает FsClient.list напрямую", async () => {
		const list: FsList = [makeFile("/a/x"), makeFile("/a/y")];
		vi.mocked(FsClient.list).mockResolvedValue(list);

		const scope = effectScope();
		const { data } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "list" }),
		);

		expect(FsClient.list).toHaveBeenCalledWith("/a", expect.any(Object));
		expect(FsClient.get).not.toHaveBeenCalled();
		expect(data.value).toEqual(list);

		scope.stop();
	});

	it("пустой path — null без сетевого вызова", async () => {
		const scope = effectScope();
		const { data } = await runIn(scope, () =>
			useProgramFetch({ path: () => "", kind: "list" }),
		);

		expect(data.value).toBeNull();
		expect(FsClient.list).not.toHaveBeenCalled();

		scope.stop();
	});
});

describe("useProgramFetch — kind='breadcrumbs'", () => {
	it("вызывает FsClient.getBreadcrumbs напрямую", async () => {
		const crumbs: Breadcrumb[] = [makeFile("/"), makeFile("/a")];
		vi.mocked(FsClient.getBreadcrumbs).mockResolvedValue(crumbs);

		const scope = effectScope();
		const { data } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "breadcrumbs" }),
		);

		expect(FsClient.getBreadcrumbs).toHaveBeenCalledWith(
			"/a",
			expect.any(Object),
		);
		expect(data.value).toEqual(crumbs);

		scope.stop();
	});
});

describe("useProgramFetch — error mapping", () => {
	it("FsServerError пробрасывается в error.value", async () => {
		const err = new FsServerError("boom", 500);
		vi.mocked(FsClient.list).mockRejectedValueOnce(err);

		const scope = effectScope();
		const { data, error } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "list" }),
		);

		expect(error.value).toBe(err);
		expect(data.value).toBeNull();

		scope.stop();
	});

	it("FsServerError — isLoading вернулся в false (finally branch)", async () => {
		vi.mocked(FsClient.list).mockRejectedValueOnce(new FsServerError("x", 500));

		const scope = effectScope();
		const { isLoading, error } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "list" }),
		);

		expect(isLoading.value).toBe(false);
		expect(error.value).toBeInstanceOf(FsServerError);

		scope.stop();
	});
});

describe("useProgramFetch — isLoading transitions", () => {
	it("false → true → false: middle state поймана внутри FsClient.list mock", async () => {
		// Стратегия: первый load уже отыграл к моменту, как мы получили ref на
		// isLoading. Чтобы захватить middle-state делаем явный refresh() —
		// внутри mock'а isLoading должен быть true; после refresh — false.
		let observedDuringFetch: boolean | undefined;
		let captured: { value: boolean } | null = null;

		vi.mocked(FsClient.list).mockImplementation(async () => {
			if (captured) observedDuringFetch = captured.value;
			return [makeFile("/a/x")] as FsList;
		});

		const scope = effectScope();
		const { isLoading, refresh, data } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "list" }),
		);
		// Initial load done.
		expect(isLoading.value).toBe(false);

		captured = isLoading;
		await refresh();
		expect(observedDuringFetch).toBe(true);
		expect(isLoading.value).toBe(false);
		expect(data.value).toEqual([makeFile("/a/x")]);

		scope.stop();
	});

	it("isLoading становится true с момента первого load (sync watcher)", async () => {
		// Альтернативная проверка: установить sync-watcher до второго refresh
		// и убедиться, что наблюдается переход true → false.
		vi.mocked(FsClient.list).mockResolvedValue([makeFile("/a/x")]);

		const scope = effectScope();
		const { isLoading, refresh } = await runIn(scope, () =>
			useProgramFetch({ path: () => "/a", kind: "list" }),
		);
		expect(isLoading.value).toBe(false);

		const transitions: boolean[] = [];
		const stop = watch(isLoading, (v) => transitions.push(v), {
			flush: "sync",
		});
		await refresh();
		stop();

		expect(transitions).toEqual([true, false]);
		scope.stop();
	});
});
