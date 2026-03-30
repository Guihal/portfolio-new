<script setup lang="ts">
    import { facts } from './facts-data';

    const currentIndex = ref(Math.floor(Math.random() * facts.length));
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const currentFact = computed(() => facts[currentIndex.value] ?? '');
    const factNumber = computed(() => currentIndex.value + 1);

    function nextFact() {
        let newIndex: number;
        do {
            newIndex = Math.floor(Math.random() * facts.length);
        } while (newIndex === currentIndex.value && facts.length > 1);
        currentIndex.value = newIndex;
    }

    onMounted(() => {
        intervalId = setInterval(nextFact, 25000);
    });

    onUnmounted(() => {
        if (intervalId) clearInterval(intervalId);
    });
</script>
<template>
    <div class="explorer__facts pixel-box">
        <div class="explorer__facts_title">Интересные факты</div>
        <div class="explorer__facts_text">
            <AnimatedText :target-text="currentFact" :simbols-per-second="40" />
        </div>
    </div>
</template>
<style lang="scss">
    .explorer__facts {
        background: c('default-3');
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: calc(50% - 5px);

        &:first-child {
            height: 100%;
        }

        &_title {
            font-size: 20px;
            padding-bottom: 10px;
            color: c('default-contrast');
        }

        &_text {
            font-size: 14px;
            color: c('default-contrast');
            max-height: 100%;
            overflow-y: auto;
            line-height: 1.2;
            word-break: break-word;
            scrollbar-color: c('default-contrast') c('default-3');
        }
    }
</style>
