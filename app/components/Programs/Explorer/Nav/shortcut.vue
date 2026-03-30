<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/Window';
    import { useGetShortcut } from '~/components/Workbench/Shortcut/useGetShortcut';

    const windowOb = inject('windowOb') as WindowOb;

    const { file } = defineProps<{
        file: FsFile;
    }>();

    const { nameText, icon } = useGetShortcut(file);

    const onclick = () => {
        windowOb.targetFile.value = file.path;
    };
</script>
<template>
    <a
        :href="file.path"
        class="explorer__shortcut explorer__shortcut_nav"
        @click.prevent="onclick">
        <div class="explorer__shortcut-icon" v-if="icon" v-html="icon"></div>
        <div class="explorer__shortcut-text">
            {{ nameText }}
        </div>
    </a>
</template>
<style lang="scss">
    .explorer__shortcut_nav {
        border: none;
    }
</style>
