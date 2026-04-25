<script setup lang="ts">
    import { useQueuedRouter } from '~/composables/useQueuedRouter';
    import { useFocusStore } from '~/stores/focus';

    // Параметры линий сетки
    const lineWidth = 1;
    const lineColor = `rgba(21, 21, 21, 0.1)`;

    const canvas: Ref<HTMLCanvasElement | null> = ref(null);
    const element: Ref<HTMLDivElement | null> = ref(null);

    // Подписка на изменения размера элемента для расчёта сетки
    const { subscribe, realCell, cellsInElement, elementBounds } = useGridCells(
        element,
        {
            width: 50, // Базовый размер ячейки
            height: 50,
        },
    );

    /**
     * Отрисовка сетки на Canvas.
     *
     * Логика:
     * 1. Учитывает devicePixelRatio для retina-дисплеев
     * 2. Масштабирует canvas через setTransform
     * 3. Рисует вертикальные и горизонтальные линии
     */
    const draw = () => {
        if (!canvas.value) return;
        const ctx = canvas.value.getContext('2d');
        if (!ctx) return;

        // Коэффициент устройства для retina-дисплеев
        const dpr = window.devicePixelRatio || 1;

        // Размеры canvas с учётом DPR
        const width = elementBounds.value.width * dpr;
        const height = elementBounds.value.height * dpr;

        canvas.value.width = width;
        canvas.value.height = height;

        // CSS-размеры остаются в логических пикселях
        canvas.value.style.width = elementBounds.value.width + 'px';
        canvas.value.style.height = elementBounds.value.height + 'px';

        // Масштабируем контекст для правильного отображения на retina
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.beginPath();

        // Вертикальные линии
        for (let i = 1; i < cellsInElement.x; i++) {
            const x = realCell.value.width * i;

            ctx.moveTo(x, 0);
            ctx.lineTo(x, elementBounds.value.height);
        }

        // Горизонтальные линии
        for (let i = 1; i < cellsInElement.y; i++) {
            const y = realCell.value.height * i;

            ctx.moveTo(0, y);
            ctx.lineTo(elementBounds.value.width, y);
        }

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;

        ctx.stroke();
    };

    // Реактивная перерисовка при изменении размеров
    watchEffect(draw);

    const focusStore = useFocusStore();
    const { queuedPush } = useQueuedRouter();
    const unFocus = () => {
        focusStore.unFocus();
        queuedPush('/');
    };

    onMounted(() => {
        subscribe();
    });
</script>
<template>
    <div class="background" ref="element" @click="unFocus">
        <canvas class="background__canvas" ref="canvas" />
    </div>
</template>
<style lang="scss">
    .background {
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: #{c('main')};

        &__canvas {
            width: 100%;
            height: 100%;
        }
    }
</style>
