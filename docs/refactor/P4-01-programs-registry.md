# P4-01. Data-driven реестр программ

**ID:** P4-01
**Фаза:** 4. Programs / Content
**Статус:** todo
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P3-01

## Цель
Переделать реестр программ так, чтобы добавление новой программы = **один новый файл**. Вынести SVG-иконки из `PROGRAMS.ts` в отдельные ассеты.

## Контекст / проблема
Сейчас `app/utils/constants/PROGRAMS.ts` содержит `Record<ProgramType, ProgramView>` из 4 программ. Каждая запись — `{ label, icon: '<svg>…</svg>', component, …ALLPROGRAMS[type] }`. Плюсы: одно место для всех. Минусы: файл на ~45 строк + **~5KB SVG inline** в bundle, все программы загружаются одним chunk-ом; добавление новой программы меняет сразу 3 места (`ProgramType`, `PROGRAMS`, `ALLPROGRAMS`).

## Затронутые файлы
- `app/utils/constants/PROGRAMS.ts` → переделать или удалить.
- `shared/utils/Programs/All.ts` → перестроить.
- `shared/types/Program.d.ts` → обновить `ProgramType` как union из ключей реестра.
- Новая директория `app/programs/`:
  - `app/programs/explorer.ts`
  - `app/programs/project.ts`
  - `app/programs/tproject.ts`
  - `app/programs/about.ts`
  - `app/programs/index.ts` — агрегатор.
- Новая директория `app/assets/icons/programs/` с SVG-файлами:
  - `explorer.svg`, `project.svg`, `tproject.svg`, `about.svg`.

## Шаги
1. Установить `unplugin-icons` (или аналог для статических SVG-as-component).
2. Перенести SVG-контент из `PROGRAMS.ts` в 4 `.svg` файла.
3. Создать `programs/explorer.ts`:
   ```
   export default {
     id: 'explorer',
     label: 'Проводник',
     icon: ExplorerIcon,
     component: defineAsyncComponent(() => import('@/components/Programs/Explorer/index.vue')),
   }
   ```
4. Аналогично — остальные программы.
5. `programs/index.ts`:
   - Собирает реестр (`Record<ProgramType, Program>`).
   - Экспортирует `getProgram(type)`, `getAllPrograms()`.
6. `shared/types/Program.d.ts`: `ProgramType` = `'explorer' | 'project' | 'tproject' | 'about'` (union из ключей).
7. Обновить консюмеров (`Window/Content.vue`, Taskbar, Workbench) — импортируют из `app/programs`.
8. Удалить `shared/utils/Programs/All.ts` и старый `PROGRAMS.ts`.

## Критерии готовности
- [ ] 4 файла `app/programs/*.ts` + `index.ts`.
- [ ] SVG-иконки — отдельные файлы.
- [ ] Bundle size для `PROGRAMS.ts` chunk уменьшился.
- [ ] `Window/Content.vue` продолжает рендерить правильный компонент по `programType`.
- [ ] `nuxi typecheck` чист.
- [ ] Добавление 5-й программы = новый файл `programs/newone.ts` + entity в content.

## Проверка
- Playwright smoke все зелёные.
- Ручной: добавить `programs/test.ts` и entity `/test/entity.json` → открыть `/test` → компонент рендерится.
