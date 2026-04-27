// P8-03 — unit tests для FsClient: happy path + 404 + 5xx-retry + abort.
// $fetch — global mock из tests/unit/setup.ts (vi.fn).

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	FsAbortedError,
	FsClient,
	FsNotFoundError,
	FsServerError,
} from "~/services/filesystem";
import type { FsFile } from "~~/shared/types/filesystem";

const fakeFile: FsFile = {
	name: "demo",
	path: "/demo",
	programType: "project",
};

function makeFetchError(status: number, message = "fetch error") {
	const err = new Error(message);
	(err as unknown as { statusCode: number }).statusCode = status;
	return err;
}

beforeEach(() => {
	vi.mocked($fetch).mockReset();
});

describe("FsClient.get", () => {
	it("happy path → resolves with FsFile", async () => {
		vi.mocked($fetch).mockResolvedValueOnce(fakeFile);

		const result = await FsClient.get("/demo");

		expect(result).toEqual(fakeFile);
		expect($fetch).toHaveBeenCalledWith("/api/filesystem/get", {
			query: { path: "/demo" },
			signal: undefined,
		});
	});

	it("404 → rejects FsNotFoundError without retry", async () => {
		vi.mocked($fetch).mockRejectedValueOnce(makeFetchError(404, "missing"));

		await expect(FsClient.get("/missing")).rejects.toBeInstanceOf(
			FsNotFoundError,
		);
		expect($fetch).toHaveBeenCalledTimes(1);
	});

	it("5xx → retries once, succeeds on 2nd attempt", async () => {
		vi.mocked($fetch)
			.mockRejectedValueOnce(makeFetchError(503, "down"))
			.mockResolvedValueOnce(fakeFile);

		const result = await FsClient.get("/demo");

		expect(result).toEqual(fakeFile);
		expect($fetch).toHaveBeenCalledTimes(2);
	});

	it("5xx twice → rejects FsServerError after 1 retry", async () => {
		vi.mocked($fetch)
			.mockRejectedValueOnce(makeFetchError(500, "boom"))
			.mockRejectedValueOnce(makeFetchError(500, "boom"));

		await expect(FsClient.get("/demo")).rejects.toBeInstanceOf(FsServerError);
		expect($fetch).toHaveBeenCalledTimes(2);
	});

	it("abort signal → rejects FsAbortedError", async () => {
		const controller = new AbortController();
		const abortErr = Object.assign(new Error("aborted"), {
			name: "AbortError",
		});
		vi.mocked($fetch).mockImplementationOnce(async () => {
			controller.abort();
			throw abortErr;
		});

		await expect(
			FsClient.get("/demo", { signal: controller.signal }),
		).rejects.toBeInstanceOf(FsAbortedError);
	});

	it("pre-aborted signal during retry backoff → FsAbortedError", async () => {
		const controller = new AbortController();
		vi.mocked($fetch).mockImplementationOnce(async () => {
			// Abort до окончания 200ms backoff между попытками.
			queueMicrotask(() => controller.abort());
			throw makeFetchError(503, "transient");
		});

		await expect(
			FsClient.get("/demo", { signal: controller.signal }),
		).rejects.toBeInstanceOf(FsAbortedError);
	});
});

describe("FsClient.list", () => {
	it("returns FsList array", async () => {
		const list: FsFile[] = [fakeFile];
		vi.mocked($fetch).mockResolvedValueOnce(list);

		const result = await FsClient.list("/");

		expect(result).toEqual(list);
		expect($fetch).toHaveBeenCalledWith("/api/filesystem/list", {
			query: { path: "/" },
			signal: undefined,
		});
	});

	it("propagates 5xx-retry → FsServerError", async () => {
		vi.mocked($fetch)
			.mockRejectedValueOnce(makeFetchError(502))
			.mockRejectedValueOnce(makeFetchError(502));

		await expect(FsClient.list("/")).rejects.toBeInstanceOf(FsServerError);
		expect($fetch).toHaveBeenCalledTimes(2);
	});
});

describe("FsClient.getBreadcrumbs", () => {
	it("returns Breadcrumb[]", async () => {
		const crumbs: FsFile[] = [fakeFile];
		vi.mocked($fetch).mockResolvedValueOnce(crumbs);

		const result = await FsClient.getBreadcrumbs("/demo");

		expect(result).toEqual(crumbs);
		expect($fetch).toHaveBeenCalledWith("/api/filesystem/breadcrumbs", {
			query: { path: "/demo" },
			signal: undefined,
		});
	});

	it("404 → FsNotFoundError carries path", async () => {
		vi.mocked($fetch).mockRejectedValueOnce(makeFetchError(404));

		await expect(FsClient.getBreadcrumbs("/ghost")).rejects.toMatchObject({
			kind: "not-found",
			path: "/ghost",
		});
	});
});
