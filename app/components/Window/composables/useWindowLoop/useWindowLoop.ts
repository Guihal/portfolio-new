import type { WatchHandle } from "vue";
import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import type { WindowOb } from "../../types";
import { Preprocessor } from "./Preprocessor";

/**
 * Контроллер анимационного цикла для плавного изменения границ окна.
 * Использует один RAF-цикл для всех свойств (left, top, height, width).
 * Пишет CSS-переменные напрямую в DOM, минуя Vue reactivity.
 */
export class WindowLoopController {
	windowOb: WindowOb;
	preprocessor: Preprocessor;
	keys: WindowBoundsKey[] = ["left", "top", "height", "width"];

	activeKeys = new Set<WindowBoundsKey>();
	watchers: WatchHandle[] = [];
	rafId: number | null = null;
	lastTimestamp = 0;
	element: HTMLElement | null = null;
	prevBounds: {
		width: number;
		height: number;
		left: number;
		top: number;
	} | null = null;

	constructor(windowOb: WindowOb) {
		this.windowOb = windowOb;
		this.preprocessor = new Preprocessor(this);
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

	/** Пишет CSS-переменные напрямую в element */
	flushToDOM(isForce = false) {
		if (!this.element) return;
		const calculated = useBoundsStore().ensure(this.windowOb.id).calculated;
		const prev = this.prevBounds;
		const threshold = 1; // Порог для предотвращения мелких обновлений
		if (
			!isForce &&
			prev &&
			Math.abs(calculated.width - prev.width) < threshold &&
			Math.abs(calculated.height - prev.height) < threshold &&
			Math.abs(calculated.left - prev.left) < threshold &&
			Math.abs(calculated.top - prev.top) < threshold
		)
			return;

		this.prevBounds = {
			width: calculated.width,
			height: calculated.height,
			left: calculated.left,
			top: calculated.top,
		};
		this.element.style.cssText = `translate:${calculated.left}px ${calculated.top}px;width:${calculated.width}px;height:${calculated.height}px`;
	}

	tick = () => {
		const now = performance.now();
		const deltaTime = now - this.lastTimestamp;
		this.lastTimestamp = now;

		const slot = useBoundsStore().ensure(this.windowOb.id);
		const { target, calculated } = slot;

		for (const key of this.keys) {
			if (!this.activeKeys.has(key)) continue;

			this.preprocessor.calculate(key, deltaTime);

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
			this.flushToDOM(true);
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

export function useWindowLoop(
	windowOb: WindowOb,
	element: Ref<HTMLElement | null>,
) {
	const loopController = new WindowLoopController(windowOb);

	onMounted(() => {
		if (element.value) {
			loopController.setElement(element.value);
		}
		loopController.start();
	});

	onBeforeUnmount(() => {
		loopController.destroy();
	});

	return loopController;
}
