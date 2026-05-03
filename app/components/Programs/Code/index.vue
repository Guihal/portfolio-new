<script setup lang="ts">
import { useInjectWindow } from "~/components/Window/composables/lifecycle/useInjectWindow";
import { useCodeSnippet } from "./composables/useCodeSnippet";

const windowOb = useInjectWindow();
const path = computed(() => windowOb.targetFile.value);
const { snippet, error, notFound } = useCodeSnippet(path);

const activeIdx = ref(0);
watch(snippet, () => { activeIdx.value = 0; });

const activeFile = computed(() => snippet.value?.files[activeIdx.value] ?? null);
</script>

<template>
	<div class="code">
		<div v-if="error" class="code__error">Не удалось загрузить :(</div>
		<div v-else-if="notFound" class="code__error">Сниппет не найден</div>
		<template v-else-if="snippet">
			<header class="code__header">
				<div class="code__title">{{ snippet.meta.windowTitle }}</div>
				<CopyButton v-if="activeFile" :text="activeFile.source" />
			</header>
			<p v-if="snippet.meta.description" class="code__desc">
				{{ snippet.meta.description }}
			</p>
			<Tabs
				v-if="snippet.files.length > 1"
				:files="snippet.files"
				:active-idx="activeIdx"
				@select="activeIdx = $event"
			/>
			<pre v-if="activeFile" class="code__pre"><code v-text="activeFile.source"></code></pre>
		</template>
	</div>
</template>

<style lang="scss" scoped>
.code {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 12px;
	gap: 8px;
	box-sizing: border-box;

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	&__title {
		@include t($fs: 14px, $cName: "default-contrast", $fw: 600);
	}

	&__desc {
		@include t($fs: 12px, $cName: "default-contrast");
		margin: 0;
		opacity: 0.7;
	}

	&__pre {
		flex: 1;
		overflow: auto;
		background: c("default-1");
		padding: 12px;
		margin: 0;
		border: 1px solid c("default-3");

		code {
			@include t($fs: 12px, $cName: "default-contrast", $family: monospace);
			white-space: pre;
		}
	}

	&__error {
		@include t($fs: 14px, $cName: "accent");
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
}
</style>
