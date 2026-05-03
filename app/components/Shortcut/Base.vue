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

<style src="./Base.scss" lang="scss"></style>
