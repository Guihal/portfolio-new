<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';
    import { useProjectData } from './composables/useProjectData';
    import { useSliderState } from './composables/useSliderState';

    const windowOb = useInjectWindow();
    const path = computed(() => windowOb.targetFile.value);
    const { data, error } = useProjectData(path);

    const images = computed(() => data.value?.images ?? []);
    const entity = computed(() => data.value?.entity);
    const sliderState = useSliderState(images);
</script>

<template>
    <div class="project">
        <Meta
            :title="entity?.name ?? path"
            :year="entity?.year"
            :tags="entity?.tags"
            :description="entity?.description"
            :links="entity?.links"
            :fallback-path="path" />
        <Slider
            v-if="!error"
            :images="images"
            :current="sliderState.current.value"
            :total="sliderState.total.value"
            :prev-disabled="sliderState.prevDisabled.value"
            :next-disabled="sliderState.nextDisabled.value"
            @next="sliderState.next"
            @prev="sliderState.prev"
            @goto="sliderState.goto" />
        <div v-else class="project__error pixel-box">
            <div class="project__error-text">Не удалось загрузить :(</div>
        </div>
    </div>
</template>

<style lang="scss">
    .project {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        gap: 16px;
        padding: 10px;

        @include cw('sm') {
            flex-direction: column-reverse;
        }
    }

    .project__error {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .project__error-text {
        @include t($fs: 16px, $lh: 1.2, $cName: 'default-contrast');
        opacity: 0.6;
    }
</style>
