import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useQueuedRouterStore } from "~/stores/queuedRouter";

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("queuedRouter store (skeleton)", () => {
	it("isEmpty === true на старте", () => {
		const s = useQueuedRouterStore();
		expect(s.isEmpty).toBe(true);
		expect(s.queue).toEqual([]);
		expect(s.lastPushedPath).toBeNull();
		expect(s.isProcessing).toBe(false);
	});

	it("push — noop до миграции P3-05", async () => {
		const s = useQueuedRouterStore();
		await expect(s.push("/a")).resolves.toBeUndefined();
		expect(s.isEmpty).toBe(true);
	});
});
