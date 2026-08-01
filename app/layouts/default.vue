<script setup lang="ts">
const route = useRoute();
</script>

<template>
    <main>
        <h1 v-if="route.path === '/'" class="visually-hidden">Рабочий стол</h1>
        <AgentIntro />
        <ClientOnly>
            <Background />
            <FullscreenPreffered />
            <!-- <PreviewPreffered /> -->
        </ClientOnly>
        <Loader />
        <slot />
        <!-- h2 после контента окон: их h1 (Profile/Meta) идёт раньше в DOM,
        иначе h2-before-h1 инвертировал бы иерархию заголовков. -->
        <h2 v-if="route.path !== '/'">Рабочий стол</h2>
    </main>
</template>

<style lang="scss"></style>
