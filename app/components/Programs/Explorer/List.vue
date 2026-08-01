<script setup lang="ts">
    const { items } = defineProps<{
        items: FsFile[];
    }>();
</script>

<template>
    <div class="explorer__content pixel-box">
        <div class="explorer__header">
            <div class="explorer__header-cell explorer__header-cell--name">
                <span class="explorer__header-spacer" />
                <span>Имя</span>
            </div>
            <div class="explorer__header-cell">Дата изменения</div>
            <div class="explorer__header-cell">Тип</div>
            <div class="explorer__header-cell explorer__header-cell--size">Размер</div>
        </div>
        <template v-if="items.length > 0">
            <ProgramsExplorerShortcut
                v-for="file in items"
                :key="file.path"
                :file />
        </template>
        <template v-else>
            <div class="explorer__empty">Тут ничего нет :(</div>
        </template>
    </div>
</template>

<style lang="scss">
    .explorer__header {
        display: grid;
        grid-template-columns: var(--explorer-grid-columns);
        align-items: center;
        min-height: 32px;
        padding: 0;
        font-size: 14px;
        color: c('default-contrast');
        opacity: 0.6;
        border-bottom: 1px solid c-rgba('default-contrast', 0.2);

        &-cell {
            display: flex;
            align-items: center;
            padding: var(--explorer-cell-padding);
            min-height: 32px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &--name {
                gap: 8px;
            }

            &--size {
                justify-content: flex-end;
            }
        }

        &-spacer {
            display: inline-block;
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }
    }

    // Mobile: 4-колоночная сетка (1fr+140+160+80) не влезает в узкое окно,
    // 1fr коллапсит и имя не видно. Сворачиваем в одну колонку и прячем
    // дату/тип/размер (они и так дублируют сущность — это видно из project
    // detail, а в list-режиме нужны только имя+иконка).
    @include cw('sm') {
        .explorer__content {
            --explorer-grid-columns: 1fr;
        }

        .explorer__header-cell:not(.explorer__header-cell--name),
        :deep(.shortcut__cell--date),
        :deep(.shortcut__cell--type),
        :deep(.shortcut__cell--size) {
            display: none;
        }
    }
</style>
