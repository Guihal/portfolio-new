<script setup lang="ts">
import type { CodeFile } from "~~/server/utils/manifest/resolveCodeContent";

defineProps<{
	files: CodeFile[];
	activeIdx: number;
}>();

const emit = defineEmits<{
	select: [idx: number];
}>();
</script>

<template>
	<ul class="code__tabs">
		<li
			v-for="(file, i) in files"
			:key="file.filename"
			:class="{ active: i === activeIdx }"
			@click="emit('select', i)"
		>
			{{ file.filename }}
		</li>
	</ul>
</template>

<style lang="scss" scoped>
.code__tabs {
	display: flex;
	gap: 4px;
	list-style: none;
	margin: 0;
	padding: 0;

	li {
		@include t($fs: 12px, $cName: "default-contrast");
		padding: 4px 8px;
		cursor: pointer;
		opacity: 0.6;
		background: c-rgba("default-2", 0.4);
		border: 1px solid c("default-3");
		transition: opacity 0.2s;

		&.active {
			opacity: 1;
			background: c("default-2");
		}
	}
}
</style>
