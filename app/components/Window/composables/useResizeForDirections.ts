import { clampHandlers, type ClampFn } from '../utils/clampers';
import type { WindowBoundsKey, WindowOb } from '../Window';

/**
 * Конфигурация цепочек свойств для изменения размера.
 *
 * При изменении одного свойства (primary), другое (compensate) должно
 * измениться в противоположную сторону для сохранения позиции противоположного края.
 *
 * Пример: при растягивании за левый край (left увеличивается),
 * ширина должна уменьшаться (compensate: width) для сохранения правого края.
 */
export const chainedProperties = {
    top: {
        primary: 'top', // Изменяем позицию top
        compensate: 'height', // Компенсируем изменением высоты
    },
    left: {
        primary: 'left',
        compensate: 'width',
    },
    bottom: {
        primary: 'height', // Просто изменяем высоту
        compensate: null, // Нет компенсации
    },
    right: {
        primary: 'width',
        compensate: null,
    },
} as const;

export type ChainedProperties = typeof chainedProperties;
export type ChainedKey = keyof ChainedProperties;
export type ControlledResult<K extends ChainedKey> = {
    [P in K]: (x: number, y: number) => void;
};

/**
 * Калькуляторы дельты для каждого направления.
 * Вычисляют, насколько нужно изменить свойство на основе позиции курсора.
 */
const calculate = {
    // Тянем верхний край вверх/вниз
    // Дельта = Курсор Y - Текущий Top окна
    top: (windowOb: WindowOb, x: number, y: number) => {
        return y - windowOb.bounds.target.top;
    },

    // Тянем левый край влево/вправо
    // Дельта = Курсор X - Текущий Left окна
    left: (windowOb: WindowOb, x: number, y: number) => {
        return x - windowOb.bounds.target.left;
    },

    // Тянем нижний край (изменяется высота)
    // Дельта = Курсор Y - Текущее дно (Top + Height)
    bottom: (windowOb: WindowOb, x: number, y: number) => {
        return y - (windowOb.bounds.target.top + windowOb.bounds.target.height);
    },

    // Тянем правый край (изменяется ширина)
    // Дельта = Курсор X - Текущий правый край (Left + Width)
    right: (windowOb: WindowOb, x: number, y: number) => {
        return x - (windowOb.bounds.target.left + windowOb.bounds.target.width);
    },
};

/**
 * Создаёт функции для изменения размера по указанным направлениям.
 *
 * Для каждого направления:
 * 1. Вычисляет дельту на основе позиции курсора
 * 2. Применяет clamp к основному свойству (ограничение границами экрана)
 * 3. Если есть compensate — применяет обратное изменение к компенсационному свойству
 *
 * @param windowOb - Объект окна
 * @param properties - Массив направлений для изменения размера
 * @returns Объект с функциями для каждого направления
 */
export function useResizeForDirections<K extends ChainedKey>(
    windowOb: WindowOb,
    properties: K[],
): ControlledResult<K> {
    const { contentArea } = useContentArea();
    const result = {} as ControlledResult<K>;

    for (const key of properties) {
        const { primary, compensate } = chainedProperties[key];

        (result as any)[key] = (x: number, y: number) => {
            // Вычисляем дельту для текущего направления
            const delta = calculate[key](windowOb, x, y);
            const bounds = windowOb.bounds.target;

            // Получаем clamp-функцию для первичного свойства
            const clampPrimary = clampHandlers[primary] as ClampFn;

            // Применяем дельту и clamp к первичному свойству
            const clampedPrimary = clampPrimary(
                bounds[primary] + delta,
                windowOb,
                contentArea.value.width,
                contentArea.value.height,
            );

            // Вычисляем фактическое изменение после clamp
            const clampedPrimaryDelta = clampedPrimary - bounds[primary];

            // Если есть компенсация — применяем обратное изменение
            if (compensate) {
                const clampCompensate = clampHandlers[compensate] as ClampFn;

                // Компенсирующее изменение (в противоположную сторону)
                const clampedCompensate = clampCompensate(
                    bounds[compensate] - delta,
                    windowOb,
                    contentArea.value.width,
                    contentArea.value.height,
                );

                const clampedCompensateDelta =
                    clampedCompensate - bounds[compensate];

                // Если одно из изменений равно 0 — выходим (достигнут предел)
                if (clampedCompensateDelta === 0 || clampedPrimaryDelta === 0)
                    return;

                bounds[compensate] = clampedCompensate;
            }

            bounds[primary] = clampedPrimary;
        };
    }

    return result;
}
