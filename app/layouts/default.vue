<script setup lang="ts">
const route = useRoute();
</script>

<template>
    <main>
        <h1 v-if="route.path === '/'" class="visually-hidden">Рабочий стол</h1>
        <ClientOnly>
            <Background />
            <FullscreenPreffered />
            <!-- <PreviewPreffered /> -->
        </ClientOnly>
        <Loader />
        <slot />
    </main>
</template>

<style lang="scss"></style>
