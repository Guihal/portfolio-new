import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useContentAreaStore } from "~/stores/contentArea";

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("contentArea store", () => {
	it("SSR-дефолт: viewport={0,0}, taskbarHeight=0, area={0,0}", () => {
		const s = useContentAreaStore();
		expect(s.viewport).toEqual({ width: 0, height: 0 });
		expect(s.taskbarHeight).toBe(0);
		expect(s.area).toEqual({ width: 0, height: 0 });
	});

	it("area = viewport.height - taskbarHeight", () => {
		const s = useContentAreaStore();
		s.setViewport({ width: 1920, height: 1080 });
		s.setTaskbarHeight(40);
		expect(s.area).toEqual({ width: 1920, height: 1040 });
	});

	it("clamp к 0 когда taskbarHeight > viewport.height", () => {
		const s = useContentAreaStore();
		s.setViewport({ width: 100, height: 40 });
		s.setTaskbarHeight(100);
		expect(s.area.height).toBe(0);
	});

	it("area реактивно пересчитывается при изменении viewport", () => {
		const s = useContentAreaStore();
		s.setViewport({ width: 800, height: 600 });
		s.setTaskbarHeight(50);
		expect(s.area).toEqual({ width: 800, height: 550 });
		s.setViewport({ width: 1024, height: 768 });
		expect(s.area).toEqual({ width: 1024, height: 718 });
	});
});
