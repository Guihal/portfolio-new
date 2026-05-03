<script setup lang="ts">
import { useInjectWindow } from "~/components/Window/composables/lifecycle/useInjectWindow";
import { useShowcaseImage } from "./composables/useShowcaseImage";

const windowOb = useInjectWindow();
const path = computed(() => windowOb.targetFile.value);
const { imageUrl, entity } = useShowcaseImage(path);
const framed = computed(() => entity.value?.tags?.includes("framed") ?? false);
</script>

<template>
	<div class="showcase" :class="{ 'showcase--framed': framed }">
		<NuxtImg
			v-if="imageUrl"
			:src="imageUrl"
			class="showcase__img"
			:class="{ 'pixel-box': framed }"
		/>
		<div v-else class="showcase__error">
			<div class="showcase__error-text">Изображение не найдено</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.showcase {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	background: c("default");
}

.showcase__img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.showcase__error {
	@include t($fs: 14px, $cName: "default-contrast");
	opacity: 0.5;
}
</style>
