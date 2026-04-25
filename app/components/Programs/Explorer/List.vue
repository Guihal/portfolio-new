<script setup lang="ts">
    const { items } = defineProps<{
        items: FsFile[];
    }>();
</script>
<template>
    <div class="explorer__content pixel-box">
        <template v-if="items.length > 0">
            <ProgramsExplorerShortcut
                v-for="file in items"
                :key="file.path"
                :file />
        </template>
        <template v-else>
            <div class="explorer__empty">Тут ничего нет :(</div>
        </template>
    </div>
</template>
