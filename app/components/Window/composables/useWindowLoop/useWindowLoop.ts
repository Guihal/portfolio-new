import type { WatchHandle } from 'vue';
import type { WindowBounds, WindowOb } from '../../Window';
import { Preprocessor } from './Preprocessor';

// Хранит состояние анимационного цикла для одного свойства (left/top/width/height)
export type WindowLoopByProp = {
    clearWatcher: WatchHandle | null; // Функция очистки watcher'а
    rafId: number | null; // ID requestAnimationFrame
    lastTimestamp: number; // Время последнего кадра для расчёта deltaTime
};

export type WindowLoop = Record<string, WindowLoopByProp>;
export type WindowBoundsKey = keyof WindowBounds;

/**
 * Контроллер анимационного цикла для плавного изменения границ окна.
 * Создаёт 4 независимых цикла (left, top, height, width), каждый работает через RAF.
 * Использует интерполяцию для плавного перехода от calculated к target значениям.
 */
export class WindowLoopController {
    windowOb: WindowOb;
    loops: WindowLoop = {};
    preprocessor: Preprocessor;
    // 4 свойства для анимации
    keys: WindowBoundsKey[] = ['left', 'top', 'height', 'width'];
    mainWatcher: null | WatchHandle = null;

    constructor(windowOb: WindowOb) {
        this.windowOb = windowOb;
        this.preprocessor = new Preprocessor(this);
    }

    start() {
        this.createLoops();
    }

    // Создаёт 4 цикла анимации для каждого свойства границ
    createLoops() {
        for (const key of this.keys) {
            const typedKey = key as WindowBoundsKey;
            this.createLoop(typedKey);
        }
    }

    // Удаляет все циклы и очищает ресурсы
    destroyLoops() {
        for (const key of this.keys) {
            const typedKey = key as WindowBoundsKey;
            this.destroyLoop(typedKey);
        }
    }

    /**
     * Создаёт watcher для отслеживания изменения bounds.target[key].
     * При изменении запускает анимацию через RAF.
     */
    createLoop(key: WindowBoundsKey) {
        if (this.loops[key] !== undefined) return;

        this.loops[key] = {
            clearWatcher: null,
            rafId: null,
            lastTimestamp: performance.now(),
        };

        // Следим за целевым значением — при изменении запускаем анимацию
        this.loops[key].clearWatcher = watch(
            () => this.windowOb.bounds.target[key],
            () => {
                this.startAnimation(key);
            },
            {
                immediate: true,
            },
        );
    }

    // Останавливает анимацию и удаляет watcher для свойства
    destroyLoop(key: WindowBoundsKey) {
        this.stopAnimation(key);
        this.clearWatcher(key);
        delete this.loops[key];
    }

    /**
     * Запускает анимационный цикл для свойства.
     * Использует RAF для плавности, рассчитывает deltaTime для независимости от FPS.
     */
    startAnimation = (key: WindowBoundsKey) => {
        if (this.loops[key]?.rafId !== null) return;

        this.loops[key].lastTimestamp = performance.now();

        const animation = () => {
            const currentTime = performance.now();
            // Время, прошедшее с последнего кадра (для плавности при разном FPS)
            const deltaTime = currentTime - this.loops[key]!.lastTimestamp;
            this.loops[key]!.lastTimestamp = currentTime;

            // Вычисляем приращение с easing и применяем к calculated
            this.preprocessor.calculate(key, deltaTime);

            // Если разница < 0.1 пикселя — считаем достигнутым, останавливаем
            if (
                Math.abs(
                    this.windowOb.bounds.calculated[key] -
                        this.windowOb.bounds.target[key],
                ) < 0.1
            ) {
                this.windowOb.bounds.calculated[key] =
                    this.windowOb.bounds.target[key];
                this.stopAnimation(key);
                return;
            }

            this.loops[key]!.rafId = requestAnimationFrame(animation);
        };

        this.loops[key].rafId = requestAnimationFrame(animation);
    };

    // Останавливает RAF для свойства
    stopAnimation = (key: WindowBoundsKey) => {
        if (!this.loops[key]?.rafId) return;
        cancelAnimationFrame(this.loops[key]!.rafId);
        this.loops[key]!.rafId = null;
    };

    // Очищает watcher свойства
    clearWatcher(key: WindowBoundsKey) {
        if (!this.loops[key]?.clearWatcher) return;
        this.loops[key]?.clearWatcher();
    }

    // Полная очистка контроллера
    destroy() {
        this.destroyLoops();
        if (!this.mainWatcher) return;
        this.mainWatcher();
    }
}

/**
 * Composable для плавной анимации границ окна.
 * Создаёт WindowLoopController при монтировании, уничтожает при unmount.
 */
export function useWindowLoop(windowOb: WindowOb) {
    const loopController = new WindowLoopController(windowOb);

    onMounted(() => {
        loopController.start();
    });

    onBeforeUnmount(() => {
        loopController.destroy();
    });
}
