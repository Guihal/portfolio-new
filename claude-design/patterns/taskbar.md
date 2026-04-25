# Pattern: Taskbar

Нижняя панель Dimonya OS. Содержит кнопку «О себе», список открытых программ (сгруппированы по `programType`), часы. Поддерживает превью окон через MutationObserver + html-to-image.

## Файлы

- `app/components/Taskbar/index.vue` — корневой компонент.
- `app/components/Taskbar/AllPrograms.vue` — список программ.
- `app/components/Taskbar/Elements/About.vue` — иконка-ссылка «О себе».
- `app/components/Taskbar/Elements/Program/index.vue` — пилюля одной программы.
- `app/components/Taskbar/Elements/Program/Frame.vue`, `AllFrames.vue`, `FrameCloseButton.vue` — миниатюры открытых окон внутри пилюли.
- `app/components/Taskbar/Elements/Program/Tooltip.vue`, `TooltipEl.vue` — превью на hover.
- `app/components/Taskbar/Elements/Program/useTaskbarFramePosition.ts`, `useTooltipContainer.ts`, `useWindowPreview.ts` — позиционирование, контейнеры, html-to-image снэпшоты.
- `app/components/TaskbarTooltipItem.vue`, `app/components/TaskbarTooltips.vue` — общий tooltip-overlay.
- `app/composables/useTaskbarTooltips.ts` — store-аналог для tooltip-state.

## Структура

```
<nav class="taskbar pixel-box">
    <TaskbarElementsAbout />          ← фиксированная иконка слева
    <TaskbarAllPrograms />            ← v-for ProgramView  (Elements/Program)
    <!-- (не реализовано) часы справа -->
</nav>
```

Taskbar — единственный sticky-элемент UI вне окна. Position fixed внизу, ширина 100%.

## Группировка окон

`windowsStore.byProgram(type)` возвращает все окна одного programType. В пилюле каждой программы рендерятся миниатюры всех её открытых окон. Пилюля одна — окон может быть много.

```
.taskbar
└── .taskbar__el (pixel-box)            ← одна программа
    ├── .taskbar__el_img (svg)          ← иконка программы
    ├── .taskbar__el_number             ← счётчик окон (border-radius — единственный
    │                                      разрешённый случай в проекте)
    └── AllFrames                        ← миниатюры окон + Tooltip
```

## Превью окон

`useWindowPreview` берёт DOM-узел окна, прогоняет через `html-to-image` (`html-to-image` в `package.json`) → data-URL. Триггер — `MutationObserver` через `frameStore` (`app/stores/frame.ts`).

Превью вставляется в `Tooltip.vue` при hover на пилюле программы — пользователь видит "сжатую" копию окна без необходимости его разворачивать.

## BEM-имена

- `.taskbar` — корневой `<nav>`. Обязательно `pixel-box`.
- `.taskbar__el` — пилюля программы. Padding 10px, transition-background 0.3s.
- `.taskbar__el_img` — иконка (`max-width: 30px; svg --icon-color: c('main')`).
- `.taskbar__el_number` — счётчик (исключение для `border-radius: 11px`, потому что круглый badge).
- `.taskbar__tooltip` — превью на hover. `pixel-box`.

## Стили

```scss
.taskbar__el {
    max-height: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 10px;
    background-color: transparent;
    transition: background-color 0.3s ease-in-out;

    @media (hover: hover) {
        &:hover {
            background-color: c-rgba('default', 0.6);
        }
    }

    &:active { background-color: c-rgba('default', 0.6); }
    &.active { background-color: c-rgba('main', 0.6); }
}
```

`c-rgba` — единственный способ получать полупрозрачный цвет, потому что SCSS-функция `rgba(var(...))` не работает в compile-time.

## Анимации

`taskbar__el-enter-active` / `taskbar__el-leave-active`:
```scss
transition-property: translate, opacity;
transition-duration: 0.3s;
transition-timing-function: ease-in-out;
```
`-enter-from` / `-leave-to`: `translate: 0 -10%; opacity: 0;` — пилюлы появляются сверху вниз.
