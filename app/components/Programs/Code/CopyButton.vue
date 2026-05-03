<script setup lang="ts">
import { copyToClipboard, isClipboardAvailable } from "~/services/clipboard";
import { COPY_FEEDBACK_MS } from "~/utils/constants/timing";

const props = defineProps<{
	text: string;
	label?: string;
}>();

const copied = ref(false);
const available = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
	available.value = isClipboardAvailable();
});

onUnmounted(() => {
	if (timer) clearTimeout(timer);
});

async function onClick() {
	const ok = await copyToClipboard(props.text);
	if (!ok) return;
	copied.value = true;
	if (timer) clearTimeout(timer);
	timer = setTimeout(() => {
		copied.value = false;
	}, COPY_FEEDBACK_MS);
}
</script>

<template>
	<button
		class="code__copy"
		:class="{ copied }"
		:disabled="!available"
		:aria-disabled="!available"
		@click="onClick"
	>
		{{ copied ? "Скопировано" : (label ?? "Скопировать") }}
	</button>
</template>

<style lang="scss" scoped>
.code__copy {
	@include t($fs: 12px, $cName: "default-contrast");
	background: c-rgba("default-2", 0.8);
	border: 1px solid c("default-3");
	padding: 4px 10px;
	cursor: pointer;
	transition: color 0.2s;

	&.copied {
		color: c("main");
	}

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
}
</style>
