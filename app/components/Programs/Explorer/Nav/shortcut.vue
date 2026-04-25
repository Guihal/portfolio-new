<script setup lang="ts">
    
    import ShortcutBase from '~/components/Shortcut/Base.vue';
import type { WindowOb } from '~/components/Window/types';

    const windowOb = inject('windowOb') as WindowOb;

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
