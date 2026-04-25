import type { WatchHandle } from "vue";
import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import type { WindowOb } from "../../types";
import { easeTowards } from "./easing";

/**
 * Контроллер анимационного цикла для плавного изменения границ окна.
 * Использует один RAF-цикл для всех свойств (left, top, height, width).
 * Пишет cssText напрямую в DOM, минуя Vue reactivity.
 */
export class WindowAnimationController {
	windowOb: WindowOb;
	keys: WindowBoundsKey[] = ["left", "top", "height", "width"];

	activeKeys = new Set<WindowBoundsKey>();
	watchers: WatchHandle[] = [];
	rafId: number | null = null;
	lastTimestamp = 0;
	element: HTMLElement | null = null;
	prevCssText = "";

	constructor(windowOb: WindowOb) {
		this.windowOb = windowOb;
	}

	setElement(el: HTMLElement) {
		this.element = el;
	}

	start() {
		const target = useBoundsStore().ensure(this.windowOb.id).target;
		for (const key of this.keys) {
			const wh = watch(
				() => target[key],
				() => {
					this.activeKeys.add(key);
					this.ensureRunning();
				},
				{ immediate: true },
			);
			this.watchers.push(wh);
		}
	}

	ensureRunning() {
		if (this.rafId !== null) return;
		this.lastTimestamp = performance.now();
		this.rafId = requestAnimationFrame(this.tick);
	}

	/** Пишет cssText в element только при изменении строки. */
	flushToDOM() {
		if (!this.element) return;
		const calculated = useBoundsStore().ensure(this.windowOb.id).calculated;
		const cssText = `translate:${calculated.left}px ${calculated.top}px;width:${calculated.width}px;height:${calculated.height}px`;
		if (cssText === this.prevCssText) return;
		this.prevCssText = cssText;
		this.element.style.cssText = cssText;
	}

	tick = () => {
		const now = performance.now();
		const deltaTime = now - this.lastTimestamp;
		this.lastTimestamp = now;

		const slot = useBoundsStore().ensure(this.windowOb.id);
		const { target, calculated } = slot;
		const interacting = Boolean(
			this.windowOb.states.drag || this.windowOb.states.resize,
		);

		for (const key of this.keys) {
			if (!this.activeKeys.has(key)) continue;

			calculated[key] = easeTowards(
				calculated[key],
				target[key],
				deltaTime,
				interacting,
			);

			if (Math.abs(calculated[key] - target[key]) < 0.1) {
				calculated[key] = target[key];
				this.activeKeys.delete(key);
			}
		}

		this.flushToDOM();

		if (this.activeKeys.size > 0) {
			this.rafId = requestAnimationFrame(this.tick);
		} else {
			this.rafId = null;
		}
	};

	destroy() {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		for (const wh of this.watchers) {
			wh();
		}
		this.watchers = [];
	}
}

export function useWindowBoundsAnimation(
	windowOb: WindowOb,
	element: Ref<HTMLElement | null>,
) {
	const controller = new WindowAnimationController(windowOb);

	onMounted(() => {
		if (element.value) {
			controller.setElement(element.value);
		}
		controller.start();
	});

	onBeforeUnmount(() => {
		controller.destroy();
	});

	return controller;
}
