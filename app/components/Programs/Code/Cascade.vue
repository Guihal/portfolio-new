<script setup lang="ts">
import { type CascadeWindowSpec, useCascadeLayout } from "~/composables/useCascadeLayout";

interface ContentResponse {
	codeWindows?: CascadeWindowSpec[];
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
	const codeWindows = data.value?.codeWindows;
	if (!codeWindows || codeWindows.length === 0) return;
	triggered.value = true;
	spawnCodeWindows(props.entityPath, codeWindows);
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
