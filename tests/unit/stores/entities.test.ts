import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FsFile } from "~~/shared/types/filesystem";

// Mock FsClient before store import — store reads FsClient at call-time,
// vi.mock hoists, поэтому safe.
vi.mock("~/services/filesystem", () => ({
	FsClient: {
		get: vi.fn(),
	},
}));

import { FsClient } from "~/services/filesystem";
import { useEntitiesStore } from "~/stores/entities";

const makeFile = (path: string): FsFile => ({
	name: path.replace(/^\//, "") || "root",
	path,
	programType: "project",
});

beforeEach(() => {
	setActivePinia(createPinia());
	vi.mocked(FsClient.get).mockReset();
});

describe("entities store — fetch + cache", () => {
	it("cache hit: повторный fetch одного path → 1 FsClient.get call", async () => {
		const s = useEntitiesStore();
		vi.mocked(FsClient.get).mockResolvedValue(makeFile("/a"));

		const a1 = await s.fetch("/a");
		const a2 = await s.fetch("/a");

		expect(a1).toEqual(makeFile("/a"));
		expect(a2).toBe(a1); // ref-equal: same cached object
		expect(FsClient.get).toHaveBeenCalledTimes(1);
	});

	it("разные path'ы — отдельные cache entries", async () => {
		const s = useEntitiesStore();
		vi.mocked(FsClient.get).mockImplementation(async (p) => makeFile(p));

		await s.fetch("/a");
		await s.fetch("/b");

		expect(FsClient.get).toHaveBeenCalledTimes(2);
		expect(s.peek("/a")).toEqual(makeFile("/a"));
		expect(s.peek("/b")).toEqual(makeFile("/b"));
	});
});

describe("entities store — in-flight dedup", () => {
	it("concurrent calls на одном path → 1 FsClient.get call", async () => {
		const s = useEntitiesStore();
		let resolveGet: (v: FsFile) => void = () => {};
		vi.mocked(FsClient.get).mockReturnValue(
			new Promise<FsFile>((res) => {
				resolveGet = res;
			}),
		);

		const p1 = s.fetch("/a");
		const p2 = s.fetch("/a");
		const p3 = s.fetch("/a");

		// Single underlying request несмотря на 3 concurrent fetch'а.
		expect(FsClient.get).toHaveBeenCalledTimes(1);

		resolveGet(makeFile("/a"));
		const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
		// Все три resolve к тому же FsFile (один источник).
		expect(r1).toEqual(makeFile("/a"));
		expect(r2).toBe(r1);
		expect(r3).toBe(r1);

		// После resolve — cached, повторный fetch не зовёт get снова.
		await s.fetch("/a");
		expect(FsClient.get).toHaveBeenCalledTimes(1);
	});

	it("error path НЕ кэшируется — следующий fetch снова зовёт FsClient.get", async () => {
		const s = useEntitiesStore();
		vi.mocked(FsClient.get)
			.mockRejectedValueOnce(new Error("server boom"))
			.mockResolvedValueOnce(makeFile("/a"));

		await expect(s.fetch("/a")).rejects.toThrow("server boom");
		// Ничего в cache не легло.
		expect(s.peek("/a")).toBeUndefined();

		// Retry → новый запрос успешен.
		const ok = await s.fetch("/a");
		expect(ok).toEqual(makeFile("/a"));
		expect(FsClient.get).toHaveBeenCalledTimes(2);
	});
});

describe("entities store — invalidate", () => {
	it("invalidate(path) убирает только этот ключ", async () => {
		const s = useEntitiesStore();
		vi.mocked(FsClient.get).mockImplementation(async (p) => makeFile(p));
		await s.fetch("/a");
		await s.fetch("/b");
		expect(FsClient.get).toHaveBeenCalledTimes(2);

		s.invalidate("/a");

		expect(s.peek("/a")).toBeUndefined();
		expect(s.peek("/b")).toEqual(makeFile("/b"));

		// /a → новый запрос, /b — cache hit.
		await s.fetch("/a");
		await s.fetch("/b");
		expect(FsClient.get).toHaveBeenCalledTimes(3);
	});

	it("invalidate() (no arg) — clears all", async () => {
		const s = useEntitiesStore();
		vi.mocked(FsClient.get).mockImplementation(async (p) => makeFile(p));
		await s.fetch("/a");
		await s.fetch("/b");
		expect(FsClient.get).toHaveBeenCalledTimes(2);

		s.invalidate();

		expect(s.peek("/a")).toBeUndefined();
		expect(s.peek("/b")).toBeUndefined();

		await s.fetch("/a");
		await s.fetch("/b");
		expect(FsClient.get).toHaveBeenCalledTimes(4);
	});
});

describe("entities store — peek", () => {
	it("peek non-fetching: на miss возвращает undefined и не зовёт FsClient.get", () => {
		const s = useEntitiesStore();
		expect(s.peek("/none")).toBeUndefined();
		expect(FsClient.get).not.toHaveBeenCalled();
	});
});
