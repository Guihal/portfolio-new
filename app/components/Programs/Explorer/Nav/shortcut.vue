<script setup lang="ts">
    
    
    import ShortcutBase from '~/components/Shortcut/Base.vue';
import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
import type { WindowOb } from '~/components/Window/types';

    const windowOb = useInjectWindow();

    const { file } = defineProps<{
        file: FsFile;
    }>();

    const activate = () => {
        windowOb.targetFile.value = file.path;
    };
</script>

<template>
    <ShortcutBase :file="file" variant="nav" :on-activate="activate" />
</template>
