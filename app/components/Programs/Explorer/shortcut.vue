<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/Window';
    import { useGetShortcut } from '~/components/Workbench/Shortcut/useGetShortcut';

    import type { FsFile } from '~~/shared/types/FsFile';

    const { windowOb, file } = defineProps<{
        windowOb: WindowOb;
        file: FsFile;
    }>();

    const { nameText, icon } = useGetShortcut(file);

    const onClick = getClickShortcutEvent(() => {
        // @ts-ignore
        windowOb.file = file;
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
        --border: 1px solid #{rgba(c('default-contrast'), 0.5)};

        border-bottom: var(--border);
        display: flex;
        gap: 10px;
        align-items: center;
        box-sizing: border-box;

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
