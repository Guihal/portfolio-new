// P0-06: debounce вызывает callback один раз после серии в окне time.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "~/components/Window/utils/debounce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("debounce", () => {
	it("серия вызовов → один callback после time", () => {
		const cb = vi.fn();
		const d = debounce(cb, 100);
		d();
		d();
		d();
		d();
		expect(cb).not.toHaveBeenCalled();
		vi.advanceTimersByTime(99);
		expect(cb).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it("передаёт последние аргументы", () => {
		const cb = vi.fn();
		const d = debounce(cb, 50);
		d("a");
		d("b");
		d("c");
		vi.advanceTimersByTime(50);
		expect(cb).toHaveBeenCalledWith("c");
	});

	it("два окна с паузой → два вызова", () => {
		const cb = vi.fn();
		const d = debounce(cb, 50);
		d();
		vi.advanceTimersByTime(50);
		d();
		vi.advanceTimersByTime(50);
		expect(cb).toHaveBeenCalledTimes(2);
	});
});
