# PR-C — Global RAF scheduler

## Цель

Заменить N независимых rAF-loops (по одному на окно) одним глобальным scheduler'ом + добавить `document.visibilityState` guard. При открытых N окнах с активной анимацией браузер всё равно склеивает rAF-callbacks в один tick, но flush + watch-callback × N остаются. Один scheduler → один tick, диспатч всем активным controllers.

## Файлы

- `app/services/animationScheduler.ts` — **NEW**. Singleton scheduler с `Set<WindowAnimationController>` + одним rAF loop.
- `app/components/Window/composables/anim/useWindowBoundsAnimation/controller.ts` — рефакторинг `WindowAnimationController`: убрать локальный `rafId`/`tick`, регистрироваться/дерегистрироваться в scheduler, оставить только `tick(deltaTime)` метод (publicly callable scheduler'ом).

## Изменение

### 1. `app/services/animationScheduler.ts` (NEW)

Singleton класс с API:

```ts
type Tickable = { tick(deltaTime: number): boolean }; // returns true if still active

class AnimationScheduler {
    private active = new Set<Tickable>();
    private rafId: number | null = null;
    private lastTimestamp = 0;
    private visibilityHandler: (() => void) | null = null;

    register(t: Tickable): void;     // добавить в active, ensureRunning
    unregister(t: Tickable): void;   // убрать из active, stop если пусто
    private ensureRunning(): void;   // start rAF если ещё не идёт + visibilityState=visible
    private loop = (): void => { ... }; // итерация по active, tick каждого, schedule next frame
    private onVisibilityChange = (): void => { ... }; // pause/resume на hidden/visible
}

export const animationScheduler = new AnimationScheduler();
```

`document.visibilityState === "hidden"` → не запускать новый rAF (pause). На `"visible"` → resume через `ensureRunning()`. Listener регистрируется один раз в конструкторе под `import.meta.client` guard.

SSR: scheduler instantiated, но методы — no-op до первого `register` под client. Альтернатива: lazy-init `if (import.meta.client)` в register/unregister.

### 2. controller.ts refactor

```ts
import { animationScheduler } from "~/services/animationScheduler";

export class WindowAnimationController {
    // удалить: rafId, lastTimestamp, ensureRunning
    // tick переименовать: было stateless arrow → теперь принимает deltaTime от scheduler
    
    tick(deltaTime: number): boolean {
        // прежняя логика, но без performance.now() и без requestAnimationFrame в конце.
        // Возвращает: this.activeKeys.size > 0
    }
    
    start() {
        // как было — watchers
        // в watch callback: animationScheduler.register(this) вместо ensureRunning()
    }
    
    destroy() {
        animationScheduler.unregister(this);
        // watchers cleanup
    }
}
```

Scheduler сам уберёт controller из active когда `tick()` вернёт `false` (после dispose всех keys). Либо `register()` идемпотентен — после tick=false controller всё ещё в Set, но при следующем `target` mutation он триггерит `register` снова.

### 3. Edge cases

- **SSR**: `animationScheduler` импортируется, но `requestAnimationFrame`/`document` доступны только client. Guard через `import.meta.client` в loop start.
- **Element not set**: `flushToDOM()` уже guard'ит `if (!this.element) return`. Scheduler tick всё равно крутит logic — это ок, calculated обновится без записи в DOM.
- **Multiple register calls**: Set дедуплицирует.
- **Visibility hide мid-animation**: pause rAF; `lastTimestamp` нужно сбросить при resume чтобы не было гигантского `deltaTime` на первом frame после resume.

## Тесты

- `bun run test:unit` — все existing animation тесты pass.
- Manual: открыть 5+ окон, drag/resize/fullscreen быстро — visually smooth, no jank.
- Manual: tab hidden → tab visible — animations resume smoothly без скачка.
- Можно добавить unit для scheduler: register/unregister, tick fanout, visibility pause/resume (vitest + jsdom + mock requestAnimationFrame).

## Приёмка

- [ ] `app/services/animationScheduler.ts` создан, exports `animationScheduler` singleton.
- [ ] `WindowAnimationController.tick` принимает `deltaTime: number`, возвращает `boolean`.
- [ ] `WindowAnimationController` НЕ вызывает `requestAnimationFrame` напрямую — только через scheduler.
- [ ] `document.visibilityState` guard в scheduler (pause on hidden, resume on visible).
- [ ] `lastTimestamp` корректно сбрасывается при resume после hide.
- [ ] SSR-safe: импорт scheduler не падает на сервере.
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run test:unit` PASS без регрессий.
- [ ] `bun run lint` clean.
- [ ] Все файлы ≤ 150 LOC.
- [ ] Service соответствует `app/services/` SSR-контракту в [docs/RULES.md](../../RULES.md): no module-scope mutable state в exported singleton (state — instance-private), DOM/document под guard.

## Architectural note

Singleton service в `app/services/`. Module-scope mutable state в classе ОК (instance-private), но instance создаётся один раз при импорте — это допустимое исключение, т.к. scheduler по природе global (один rAF на страницу). Если SSR-leak станет проблемой (state между запросами) — переделать в Pinia store, но overhead Pinia на rAF hot path нежелателен. Документировать SSR-контракт в JSDoc у класса.
