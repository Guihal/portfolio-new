<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/Window';
    import { useGetShortcut } from '~/components/Workbench/Shortcut/useGetShortcut';

    const windowOb = inject('windowOb') as WindowOb;

    const { file } = defineProps<{
        file: FsFile;
    }>();

    const { nameText, icon } = useGetShortcut(file);

    const onClick = getClickShortcutEvent(() => {
        windowOb.targetFile.value = file.path;
    });
</script>

<template>
    <a :href="file.path" class="explorer__shortcut" @click="onClick">
        <div class="explorer__shortcut-icon" v-if="icon" v-html="icon"></div>
        <div class="explorer__shortcut-text">
            {{ nameText }}
        </div>
    </a>
</template>

<style lang="scss">
    .explorer__shortcut {
        padding: 10px;
        --border: 1px solid #{rgba(c('default-contrast'), 0.2)};

        border-bottom: var(--border);
        display: flex;
        gap: 10px;
        align-items: center;
        box-sizing: border-box;
        background: c('default-2');

        &:nth-child(2n) {
            background: c('default-1');
        }

        width: calc(100%);

        &:first-child {
            border-top: var(--border);
        }

        &-text {
            color: c('default-contrast');
            letter-spacing: 0.02em;
            line-height: 100%;
            max-width: 100%;
            overflow: hidden;
        }

        &-icon {
            --icon-color: #{c('default-contrast')};
            aspect-ratio: 1 / 1;
            width: 20px;
            height: 20px;

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }
</style>
