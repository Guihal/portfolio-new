<script setup lang="ts">
    import type { File } from '~~/shared/types/File';
    import { useGetShortcut } from './useGetShortcut';
    import { useCreateAndRegisterWindow } from '~/components/Window/composables/useCreateAndRegisterWindow';

    const { file } = defineProps<{
        file: File;
    }>();

    const { isRegisteredFile, icon, nameText } = useGetShortcut(file);

    const onClick = getClickShortcutEvent(() => {
        useCreateAndRegisterWindow(file);
    });
</script>
<template>
    <a
        v-if="isRegisteredFile"
        :href="file.path"
        class="shortcut"
        @click="onClick">
        <div class="shortcut_img" v-html="icon"></div>
        <div class="shortcut_text">{{ nameText }}</div>
    </a>
</template>
<style lang="scss">
    .shortcut {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        box-sizing: border-box;

        gap: 10px;
        width: 100%;

        &_text {
            max-width: 100%;
            text-overflow: ellipsis;
            overflow: hidden;
            font-family: Pix, system-ui;
            font-size: 16px;
            line-height: 1;
            font-weight: 700;
            color: c('default');
            letter-spacing: 0.02em;
            flex-shrink: 0;
            white-space: nowrap;
            text-align: center;
        }

        &_img {
            aspect-ratio: 1 / 1;
            width: 100%;
            max-width: 70px;

            svg {
                width: 100%;
                height: 100%;

                --icon-color: #{c('default')};
            }
        }
    }
</style>
