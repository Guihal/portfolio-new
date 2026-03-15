import type { WindowBoundsKey } from '../../Window';
import { chainedProperties } from '../useResizeForDirections';
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
    // Коэффициент сглаживания (reactive, зависит от состояния окна)
    inerpolatedCoeff: Ref<number>;

    constructor(controller: WindowLoopController) {
        this.controller = controller;
        // Вычисляем коэффициент на основе состояний окна
        this.inerpolatedCoeff = computed(() => {
            if (
                this.controller.windowOb.states.drag ||
                this.controller.windowOb.states.resize
            ) {
                return 0.6; // Быстрая интерполяция при взаимодействии
            }
            return 0.9; // Медленная плавная доводка
        });
    }

    /**
     * Вычисляет новое значение calculated[key] с применением easing.
     * @param key - Свойство для анимации (left/top/width/height)
     * @param deltaTime - Время с последнего кадра (мс)
     */
    calculate(key: WindowBoundsKey, deltaTime: number) {
        // Разница между целевым и текущим значением
        const delta =
            this.controller.windowOb.bounds.target[key] -
            this.controller.windowOb.bounds.calculated[key];

        // Применяем easing к дельте
        const totalDelta = this.getEaysied(delta, deltaTime);

        // Обновляем текущее (анимированное) значение
        this.controller.windowOb.bounds.calculated[key] += totalDelta;
    }

    /**
     * Формула easing для плавного приближения к цели.
     * factor = 1 - coeff^(deltaTime/16)
     *
     * Деление на 16 нормализует коэффициент под 60 FPS (16ms ≈ 1 кадр).
     * При deltaTime=16 и coeff=0.9: factor ≈ 0.1 (10% от дельты за кадр)
     */
    getEaysied(delta: number, deltaTime: number) {
        const factor =
            1 - Math.pow(this.inerpolatedCoeff.value, deltaTime / 16);

        return delta * factor;
    }
}
