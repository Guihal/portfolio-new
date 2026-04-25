<script setup lang="ts">
    const { targetText, simbolsPerSecond = 5 } = defineProps<{
        targetText: string;
        simbolsPerSecond?: number;
    }>();

    const lastTargetText = ref(targetText);
    const currentTextLength = ref(targetText.length);

    let direction: 1 | -1 = 1;
    let rafId: number | null = null;
    let lastTime: number | null = null;

    const displayedText = computed(() => {
        const base =
            lastTargetText.value !== targetText
                ? lastTargetText.value
                : targetText;
        return base.slice(0, Math.round(currentTextLength.value));
    });

    let randomInterval: ReturnType<typeof setTimeout> | undefined;
    let randomDelta = 1;

    const randomTick = () => {
        randomDelta = Math.max(Math.random(), 0.4);
        setTimeout(randomTick, 400 * randomDelta);
    };

    function tick(time: number) {
        if (lastTime === null) {
            lastTime = time;
            rafId = requestAnimationFrame(tick);
            return;
        }

        const delta = time - lastTime;
        lastTime = time;
        currentTextLength.value +=
            (delta / 1000) * simbolsPerSecond * direction * randomDelta;

        if (direction === -1 && currentTextLength.value <= 0) {
            currentTextLength.value = 0;
            lastTargetText.value = targetText;
            direction = 1;
            lastTime = null;

            if (targetText.length === 0) {
                rafId = null;
                return;
            }

            rafId = requestAnimationFrame(tick);
            return;
        }

        if (direction === 1 && currentTextLength.value >= targetText.length) {
            currentTextLength.value = targetText.length;
            rafId = null;
            lastTime = null;
            return;
        }

        rafId = requestAnimationFrame(tick);
    }

    function startAnimation() {
        if (rafId !== null) return;
        lastTime = null;
        rafId = requestAnimationFrame(tick);
    }

    watch(
        () => targetText,
        (newText) => {
            if (newText === lastTargetText.value && direction === 1) return;

            direction = -1;
            startAnimation();
        },
    );

    onMounted(() => {
        randomTick();
    });

    onUnmounted(() => {
        clearInterval(randomInterval);
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    });
</script>

<template>
    <div class="animated-text">
        {{ displayedText }}
        <template v-if="displayedText.length !== targetText.length">|</template>
    </div>
</template>

<style lang="scss"></style>
