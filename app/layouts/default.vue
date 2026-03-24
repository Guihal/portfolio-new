<script setup lang="ts"></script>
<template>
    <main>
        <ClientOnly>
            <Background />
            <FullscreenPreffered />
        </ClientOnly>
        <Loader />
        <slot />
    </main>
</template>
<style lang="scss"></style>
