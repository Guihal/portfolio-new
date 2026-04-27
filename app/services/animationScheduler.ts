// PR-C: единый rAF-loop на страницу. Регистрирует Tickable-объекты (controllers
// окон), на каждый кадр зовёт tick(deltaTime) у активных. Visibility guard
// ставит loop на паузу при скрытой вкладке и сбрасывает таймстамп при resume —
// чтобы первый deltaTime после возврата не был гигантским.
//
// SSR-контракт (docs/RULES.md §2a): instance state private, listeners
// регистрируются лениво под import.meta.client. На сервере register/unregister
// — no-op (state остаётся пустым). Singleton по природе global (один rAF на
// страницу); rebuild через Pinia дал бы overhead на hot path.

export type Tickable = {
	/** Возвращает true если объект всё ещё активен и хочет следующий tick. */
	tick(deltaTime: number): boolean;
};

class AnimationScheduler {
	private active = new Set<Tickable>();
	private rafId: number | null = null;
	private lastTimestamp = 0;
	private visibilityBound = false;

	register(t: Tickable): void {
		if (!import.meta.client) return;
		this.active.add(t);
		this.bindVisibility();
		this.ensureRunning();
	}

	unregister(t: Tickable): void {
		if (!import.meta.client) return;
		this.active.delete(t);
		if (this.active.size === 0) this.stop();
	}

	private bindVisibility(): void {
		if (this.visibilityBound) return;
		if (typeof document === "undefined") return;
		document.addEventListener("visibilitychange", this.onVisibilityChange);
		this.visibilityBound = true;
	}

	private ensureRunning(): void {
		if (this.rafId !== null) return;
		if (
			typeof document !== "undefined" &&
			document.visibilityState === "hidden"
		)
			return;
		this.lastTimestamp = performance.now();
		this.rafId = requestAnimationFrame(this.loop);
	}

	private stop(): void {
		if (this.rafId === null) return;
		cancelAnimationFrame(this.rafId);
		this.rafId = null;
	}

	private loop = (now: number): void => {
		const deltaTime = now - this.lastTimestamp;
		this.lastTimestamp = now;

		for (const t of this.active) {
			const stillActive = t.tick(deltaTime);
			if (!stillActive) this.active.delete(t);
		}

		if (this.active.size > 0) {
			this.rafId = requestAnimationFrame(this.loop);
		} else {
			this.rafId = null;
		}
	};

	private onVisibilityChange = (): void => {
		if (typeof document === "undefined") return;
		if (document.visibilityState === "hidden") {
			this.stop();
			return;
		}
		if (this.active.size > 0) this.ensureRunning();
	};
}

export const animationScheduler = new AnimationScheduler();
