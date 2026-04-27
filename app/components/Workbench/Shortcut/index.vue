<script setup lang="ts">
    
    import ShortcutBase from '~/components/Shortcut/Base.vue';
    import { useCreateAndRegisterWindow } from '~/components/Window/composables/lifecycle/useCreateAndRegisterWindow';
import type { FsFile } from '~~/shared/types/filesystem';

    const { file } = defineProps<{
        file: FsFile;
    }>();

    const activate = () => {
        useCreateAndRegisterWindow(file);
    };
</script>

<template>
    <ShortcutBase :file="file" variant="desktop" :on-activate="activate" />
</template>
