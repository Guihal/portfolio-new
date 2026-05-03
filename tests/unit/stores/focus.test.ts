import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useFocusStore } from "~/stores/focus";

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("focus store", () => {
	it("focus/unFocus", () => {
		const s = useFocusStore();
		s.focus("42");
		expect(s.focusedId).toBe("42");
		expect(s.isFocused("42").value).toBe(true);
		expect(s.isFocused("99").value).toBe(false);
		s.unFocus();
		expect(s.focusedId).toBeNull();
	});

	it("повторный focus того же id — no-op (early return)", () => {
		const s = useFocusStore();
		s.focus("1");
		const ref = s.focusedId;
		s.focus("1");
		expect(s.focusedId).toBe(ref);
	});

	it("isFocused реактивен при смене focusedId", () => {
		const s = useFocusStore();
		const isOne = s.isFocused("1");
		expect(isOne.value).toBe(false);
		s.focus("1");
		expect(isOne.value).toBe(true);
		s.focus("2");
		expect(isOne.value).toBe(false);
		s.unFocus();
		expect(isOne.value).toBe(false);
	});
});
