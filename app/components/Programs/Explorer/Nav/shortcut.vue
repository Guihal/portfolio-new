<script setup lang="ts">
    
    
    import ShortcutBase from '~/components/Shortcut/Base.vue';
import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
import { useWindowsStore } from '~/stores/windows';

    const windowOb = useInjectWindow();
    const windowsStore = useWindowsStore();

    const { file } = defineProps<{
        file: FsFile;
    }>();

    const activate = () => {
        windowsStore.setTargetFile(windowOb.id, file.path);
    };
</script>

<template>
    <ShortcutBase :file="file" variant="nav" :on-activate="activate" />
</template>
