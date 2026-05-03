<script setup lang="ts">
    defineProps<{
        title: string;
        year?: string;
        tags?: string[];
        description?: string;
        links?: { label: string; href: string }[];
        fallbackPath?: string;
    }>();
</script>

<template>
    <div class="project__meta pixel-box">
        <h1 class="project__title">{{ title }}</h1>
        <div v-if="year" class="project__year">{{ year }}</div>
        <div v-else-if="fallbackPath" class="project__year project__year--dim">
            {{ fallbackPath }}
        </div>
        <ul v-if="tags?.length" class="project__tags">
            <li v-for="tag in tags" :key="tag" class="project__tag">{{ tag }}</li>
        </ul>
        <p v-if="description" class="project__description">{{ description }}</p>
        <ul v-if="links?.length" class="project__links">
            <li v-for="link in links" :key="link.href" class="project__link-item">
                <a
                    :href="link.href"
                    :target="link.href.startsWith('http') ? '_blank' : '_self'"
                    rel="noopener"
                    class="project__link">
                    {{ link.label }}
                </a>
            </li>
        </ul>
    </div>
</template>

<style lang="scss">
    .project__meta {
        box-sizing: border-box;
        width: 260px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        overflow-y: auto;
        overflow-x: hidden;

        @include cw('sm') {
            width: 100%;
            max-height: 40%;
        }
    }

    .project__title {
        @include t($fs: 20px, $lh: 1.2, $cName: 'default-contrast', $fw: 700);
        margin: 0;
    }

    .project__year {
        @include t($fs: 14px, $lh: 1.2, $cName: 'accent');

        &--dim {
            opacity: 0.4;
        }
    }

    .project__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .project__tag {
        @include t($fs: 12px, $lh: 1, $cName: 'default-contrast');
        padding: 4px 8px;
        background: c('default-3');
    }

    .project__description {
        @include t($fs: 14px, $lh: 1.4, $cName: 'default-contrast');
        margin: 0;
        white-space: pre-wrap;
        overflow-y: auto;
    }

    .project__links {
        display: flex;
        flex-direction: column;
        gap: 6px;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .project__link {
        @include t($fs: 14px, $lh: 1.2, $cName: 'main');
        text-decoration: underline;

        &:hover {
            color: c('accent');
        }
    }
</style>
