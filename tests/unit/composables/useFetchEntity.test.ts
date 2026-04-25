import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useFetchEntity } from "~/components/Window/composables/useFetchEntity";
import { useWindowsStore } from "~/stores/windows";
import type { FsFile } from "~~/shared/types/filesystem";

const makeFile = (path = "/a"): FsFile => ({
	name: "a",
	path,
	programType: "project",
});

beforeEach(() => {
	setActivePinia(createPinia());
	vi.mocked($fetch).mockReset();
	vi.mocked(clearNuxtData).mockReset();
});

describe("useFetchEntity", () => {
	it("success path → windowOb.file установлен, error undefined", async () => {
		const s = useWindowsStore();
		const w = s.create("/a");
		const route = ref("/a");
		vi.mocked($fetch).mockResolvedValueOnce(makeFile("/a"));

		const scope = effectScope();
		await scope.run(() => useFetchEntity(w, route));

		expect(w.file).toEqual(makeFile("/a"));
		expect(w.states.error).toBeUndefined();
		expect(w.errorMessage).toBeUndefined();

		scope.stop();
	});

	it("non-abort error → setError, errorMessage установлен", async () => {
		const s = useWindowsStore();
		const w = s.create("/a");
		const route = ref("/a");
		const err = Object.assign(new Error("not found"), { statusMessage: "404" });
		vi.mocked($fetch).mockRejectedValueOnce(err);

		const scope = effectScope();
		await scope.run(() => useFetchEntity(w, route));

		expect(w.states.error).toBe(true);
		expect(w.errorMessage).toBe("404");

		scope.stop();
	});

	it("abort error НЕ триггерит setError", async () => {
		const s = useWindowsStore();
		const w = s.create("/a");
		const route = ref("/a");
		const abortErr = Object.assign(new Error("aborted"), {
			name: "AbortError",
		});
		vi.mocked($fetch).mockRejectedValueOnce(abortErr);

		const scope = effectScope();
		await scope.run(() => useFetchEntity(w, route));

		expect(w.states.error).toBeUndefined();
		expect(w.errorMessage).toBeUndefined();

		scope.stop();
	});

	it("multi-window isolation: ошибка в одном не аффектит другое", async () => {
		const s = useWindowsStore();
		const w1 = s.create("/a");
		const w2 = s.create("/b");
		const r1 = ref("/a");
		const r2 = ref("/b");

		vi.mocked($fetch)
			.mockRejectedValueOnce(
				Object.assign(new Error("server"), { statusMessage: "500" }),
			)
			.mockResolvedValueOnce(makeFile("/b"));

		const scope1 = effectScope();
		const scope2 = effectScope();
		await scope1.run(() => useFetchEntity(w1, r1));
		await scope2.run(() => useFetchEntity(w2, r2));

		expect(w1.states.error).toBe(true);
		expect(w1.errorMessage).toBe("500");
		expect(w2.states.error).toBeUndefined();
		expect(w2.file).toEqual(makeFile("/b"));

		scope1.stop();
		scope2.stop();
	});

	it("default message при пустом error", async () => {
		const s = useWindowsStore();
		const w = s.create("/a");
		const route = ref("/a");
		vi.mocked($fetch).mockRejectedValueOnce({});

		const scope = effectScope();
		await scope.run(() => useFetchEntity(w, route));

		expect(w.states.error).toBe(true);
		expect(w.errorMessage).toBe("Не удалось открыть");

		scope.stop();
	});

	it("per-window cache key: разные id → разные ключи", async () => {
		const s = useWindowsStore();
		const w1 = s.create("/a");
		const w2 = s.create("/a");
		const r = ref("/a");

		const useAsyncDataSpy = vi.spyOn(
			globalThis as { useAsyncData: typeof useAsyncData },
			"useAsyncData",
		);

		vi.mocked($fetch)
			.mockResolvedValueOnce(makeFile("/a"))
			.mockResolvedValueOnce(makeFile("/a"));

		const scope1 = effectScope();
		const scope2 = effectScope();
		await scope1.run(() => useFetchEntity(w1, r));
		await scope2.run(() => useFetchEntity(w2, r));

		const keyFns = useAsyncDataSpy.mock.calls.map((c) => c[0]);
		const keys = keyFns.map((k) => (typeof k === "function" ? k() : k));
		expect(keys[0]).toBe(`window-entity-${w1.id}-/a`);
		expect(keys[1]).toBe(`window-entity-${w2.id}-/a`);
		expect(keys[0]).not.toBe(keys[1]);

		useAsyncDataSpy.mockRestore();
		scope1.stop();
		scope2.stop();
	});

	it("recovery: успешный data после ошибки очищает error в store", async () => {
		const s = useWindowsStore();
		const w = s.create("/a");
		const route = ref("/a");
		// pre-set error (имитируем stuck state после refresh без loading-cycle).
		s.setError(w.id, "stale");
		vi.mocked($fetch).mockResolvedValueOnce(makeFile("/a"));

		const scope = effectScope();
		await scope.run(() => useFetchEntity(w, route));

		expect(w.states.error).toBeUndefined();
		expect(w.errorMessage).toBeUndefined();
		expect(w.file).toEqual(makeFile("/a"));

		scope.stop();
	});

	it("dispose cleanup: clearNuxtData вызван с predicate match'ащим windowOb.id", async () => {
		const s = useWindowsStore();
		const w = s.create("/a");
		const route = ref("/a");
		vi.mocked($fetch).mockResolvedValueOnce(makeFile("/a"));

		const scope = effectScope();
		await scope.run(() => useFetchEntity(w, route));
		scope.stop();

		const calls = vi.mocked(clearNuxtData).mock.calls;
		// onScopeDispose добавил один вызов clearNuxtData с predicate fn.
		const disposeCall = calls.find((c) => typeof c[0] === "function");
		expect(disposeCall).toBeDefined();
		const predicate = disposeCall![0] as (k: string) => boolean;
		expect(predicate(`window-entity-${w.id}-/a`)).toBe(true);
		expect(predicate(`window-entity-${w.id}-/anything`)).toBe(true);
		expect(predicate(`window-entity-other-/a`)).toBe(false);
		expect(predicate(`unrelated-key`)).toBe(false);
	});
});
