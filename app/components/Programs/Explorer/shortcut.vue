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
        padding: 5px 0;
        --shortcut-color: #{c('default-contrast')};

        --border: 1px solid #{c('default-contrast')};
        // border-bottom: var(--border);
        display: flex;
        gap: 10px;
        align-items: center;
        box-sizing: border-box;
        background: transparent;
        transition: border 0.3s ease-in-out;

        &:nth-child(2n) {
            //background: rgba(c('default-contrast'), 0.1);
        }

        &:nth-child(1) {
            padding-top: 0;
        }

        width: calc(100%);

        @media (hover: hover) {
            &:hover {
                --shortcut-color: #{c('accent')};
            }
        }

        &:active {
            --shortcut-color: #{c('accent')};
        }

        &-text {
            color: var(--shortcut-color);
            letter-spacing: 0.02em;
            line-height: 100%;
            max-width: 100%;
            font-size: 15px;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.3s ease-in-out;
            height: fit-content;
            white-space: nowrap;
        }

        &-icon {
            --icon-color: var(--shortcut-color);
            aspect-ratio: 1 / 1;
            width: 20px;
            height: 20px;

            svg {
                width: 100%;
                height: 100%;

                path {
                    transition: fill 0.3s ease-in-out;
                }
            }
        }
    }
</style>
