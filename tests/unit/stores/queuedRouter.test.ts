import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQueuedRouterStore } from "~/stores/queuedRouter";

let pushMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	pushMock = vi.fn().mockResolvedValue(undefined);
	(
		globalThis as unknown as { useRouter: () => { push: typeof pushMock } }
	).useRouter = () => ({ push: pushMock });
	setActivePinia(createPinia());
});

describe("queuedRouter store", () => {
	it("isEmpty === true на старте", () => {
		const s = useQueuedRouterStore();
		expect(s.isEmpty).toBe(true);
		expect(s.queue).toEqual([]);
		expect(s.lastPushedPath).toBeNull();
		expect(s.isProcessing).toBe(false);
	});

	it("push('/a'), push('/a') — router.push вызван один раз (дедуп)", async () => {
		const s = useQueuedRouterStore();
		const p1 = s.push("/a");
		const p2 = s.push("/a");
		await Promise.all([p1, p2]);
		expect(pushMock).toHaveBeenCalledTimes(1);
		expect(pushMock).toHaveBeenCalledWith("/a");
	});

	it("push('/a'), push('/b') — два router.push в правильном порядке", async () => {
		const s = useQueuedRouterStore();
		const p1 = s.push("/a");
		const p2 = s.push("/b");
		await Promise.all([p1, p2]);
		expect(pushMock).toHaveBeenCalledTimes(2);
		expect(pushMock).toHaveBeenNthCalledWith(1, "/a");
		expect(pushMock).toHaveBeenNthCalledWith(2, "/b");
	});

	it("повторный push того же пути после завершения — дедуп через lastPushedPath", async () => {
		const s = useQueuedRouterStore();
		await s.push("/a");
		await s.push("/a");
		expect(pushMock).toHaveBeenCalledTimes(1);
	});
});
