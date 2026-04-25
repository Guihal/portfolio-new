<script setup lang="ts">
    import type { FsFile } from '~~/shared/types/filesystem';

    const props = defineProps<{
        file: FsFile;
        variant: 'desktop' | 'list' | 'nav';
        onActivate: () => void;
    }>();

    const { isRegisteredFile, icon, nameText } = useGetShortcut(props.file);

    const desktopHandler = getClickShortcutEvent(() => props.onActivate());
    const simpleHandler = (e: MouseEvent) => {
        e.preventDefault();
        props.onActivate();
    };

    const handler = computed(() =>
        props.variant === 'desktop' ? desktopHandler : simpleHandler,
    );
</script>

<template>
    <a
        v-if="isRegisteredFile"
        :href="file.path"
        :class="['shortcut', `shortcut--${variant}`]"
        @click="handler">
        <slot name="icon">
            <div v-if="icon" class="shortcut__icon" v-html="icon" />
        </slot>
        <slot name="text">
            <div class="shortcut__text">{{ nameText }}</div>
        </slot>
    </a>
</template>

<style lang="scss">
    .shortcut {
        display: flex;
        box-sizing: border-box;
        background: transparent;
        --shortcut-color: #{c('default')};
        transition: opacity 0.3s ease-in-out;

        @media (hover: hover) {
            &:hover {
                opacity: 0.9;
            }
        }

        &:active {
            opacity: 0.9;
        }

        &__icon {
            aspect-ratio: 1 / 1;
            flex-shrink: 0;

            svg {
                width: 100%;
                height: 100%;

                --icon-color: #{var(--shortcut-color)};

                path {
                    transition:
                        fill 0.3s ease-in-out,
                        stroke 0.3s ease-in-out;
                }
            }
        }

        &__text {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--shortcut-color);
            letter-spacing: 0.02em;
            transition: color 0.3s ease-in-out;
        }

        &--desktop {
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            gap: 10px;
            width: 100%;

            .shortcut__icon {
                width: 100%;
                max-width: 70px;
            }

            .shortcut__text {
                font-family: $t-default;
                font-size: 16px;
                font-weight: 700;
                line-height: 1;
                text-align: center;
            }
        }

        &--list {
            flex-direction: row;
            align-items: center;
            gap: 10px;
            padding: 5px 0;
            width: 100%;
            --shortcut-color: #{c('default-contrast')};

            @media (hover: hover) {
                &:hover {
                    --shortcut-color: #{c('accent')};
                }
            }

            &:active {
                --shortcut-color: #{c('accent')};
            }

            .shortcut__icon {
                width: 20px;
                height: 20px;
            }

            .shortcut__text {
                font-size: 15px;
                line-height: 100%;
                height: fit-content;
            }
        }

        &--nav {
            @extend .shortcut--list;
            border: none;
        }
    }
</style>
