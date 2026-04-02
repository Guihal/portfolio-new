import {
    getTargetBounds,
    getCalculatedBounds,
    type WindowBoundsKey,
} from '~/composables/useWindowBounds';
import type { WindowLoopController } from './useWindowLoop';

/**
 * Пре processor для расчёта интерполяции значений границ.
 * Вычисляет плавное приращение с использованием easing-коэффициента.
 *
 * Коэффициент интерполяции:
 * - 0.6 — при drag/resize (быстрая реакция на действия пользователя)
 * - 0.9 — в обычном режиме (плавная доводка до целевого значения)
 */
export class Preprocessor {
    controller: WindowLoopController;

    constructor(controller: WindowLoopController) {
        this.controller = controller;
    }

    /** Кешированный коэффициент на текущий кадр */
    private getCoeff(): number {
        if (
            this.controller.windowOb.states.drag ||
            this.controller.windowOb.states.resize
        ) {
            return 0.6;
        }
        return 0.9;
    }

    /**
     * Вычисляет новое значение calculated[key] с применением easing.
     * @param key - Свойство для анимации (left/top/width/height)
     * @param deltaTime - Время с последнего кадра (мс)
     */
    calculate(key: WindowBoundsKey, deltaTime: number) {
        const target = getTargetBounds(this.controller.windowOb.id);
        const calculated = getCalculatedBounds(this.controller.windowOb.id);

        // Разница между целевым и текущим значением
        const delta = target[key] - calculated[key];

        // Применяем easing к дельте
        const totalDelta = this.getEaysied(delta, deltaTime);

        // Обновляем текущее (анимированное) значение
        calculated[key] += totalDelta;
    }

    /**
     * Формула easing для плавного приближения к цели.
     * factor = 1 - coeff^(deltaTime/16)
     *
     * Деление на 16 нормализует коэффициент под 60 FPS (16ms ≈ 1 кадр).
     * При deltaTime=16 и coeff=0.9: factor ≈ 0.1 (10% от дельты за кадр)
     */
    getEaysied(delta: number, deltaTime: number) {
        const coeff = this.getCoeff();
        const factor = 1 - Math.pow(coeff, deltaTime / 16);

        return delta * factor;
    }
}
