<script setup lang="ts">
    
    import { getProgram } from '~/programs';
import type { FsFile } from '~~/shared/types/filesystem';

    const props = defineProps<{
        file: FsFile;
        variant: 'desktop' | 'list' | 'nav' | 'table';
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

    const program = computed(() => getProgram(props.file.programType));
    const typeLabel = computed(() => program.value?.label ?? '');
    const formattedDate = computed(() =>
        props.file.mtime ? formatMtime(props.file.mtime) : '—',
    );
    const formattedSize = computed(() =>
        props.file.size != null ? formatSize(props.file.size) : '—',
    );
</script>

<template>
    <a
        v-if="isRegisteredFile"
        :href="file.path"
        :class="['shortcut', `shortcut--${variant}`]"
        @click="handler">
        <template v-if="variant === 'table'">
            <div class="shortcut__cell shortcut__cell--name">
                <slot name="icon">
                    <div v-if="icon" class="shortcut__icon" v-html="icon" />
                </slot>
                <div class="shortcut__text">{{ nameText }}</div>
            </div>
            <div class="shortcut__cell shortcut__cell--date">
                {{ formattedDate }}
            </div>
            <div class="shortcut__cell shortcut__cell--type">
                {{ typeLabel }}
            </div>
            <div class="shortcut__cell shortcut__cell--size">
                {{ formattedSize }}
            </div>
        </template>
        <template v-else>
            <slot name="icon">
                <div v-if="icon" class="shortcut__icon" v-html="icon" />
            </slot>
            <slot name="text">
                <div class="shortcut__text">{{ nameText }}</div>
            </slot>
        </template>
    </a>
</template>

<style src="./Base.scss" lang="scss"></style>
