<script setup lang="ts">
import { useCascadeLayout } from "~/composables/useCascadeLayout";
import type { CodeWindowsConfig } from "~~/server/utils/manifest/resolveCodeContent";

interface ContentResponse {
	codeWindows?: CodeWindowsConfig;
}

const props = defineProps<{ entityPath: string }>();

const { data } = await useFetch<ContentResponse>("/api/filesystem/content", {
	query: { path: props.entityPath },
	key: () => `cascade:${props.entityPath}`,
	server: true,
});

const { spawnCodeWindows } = useCascadeLayout();

const triggered = ref(false);
watchEffect(() => {
	if (triggered.value) return;
	const config = data.value?.codeWindows;
	if (!config || config.windows.length === 0) return;
	triggered.value = true;
	spawnCodeWindows(props.entityPath, config);
});
</script>

<template>
	<div class="cascade-orchestrator" />
</template>

<style lang="scss" scoped>
.cascade-orchestrator {
	display: none;
}
</style>
