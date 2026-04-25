# P4-02. ProgramContext для режимов

**ID:** P4-02
**Фаза:** 4. Programs / Content
**Статус:** todo
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P4-01

## Цель
Убрать дублирование: `explorer`, `project`, `tproject` используют **один и тот же** компонент. Ввести `ProgramContext`, чтобы различие было в конфиге, а не в отдельных файлах.

## Контекст / проблема
В `PROGRAMS.ts` три записи (`explorer`, `project`, `tproject`) все указывают на `Programs/Explorer/index.vue`. То есть это не три программы, а одна с тремя режимами. Нет API для передачи режима в компонент — код не различает, в каком режиме он сейчас работает.

## Затронутые файлы
- `app/programs/explorer.ts`, `project.ts`, `tproject.ts`.
- `app/components/Programs/Explorer/index.vue`.
- `app/components/Programs/Explorer/Nav/*`.
- `app/components/Window/Content.vue` (провайдит контекст).

## Шаги
1. Ввести тип `ProgramMode = 'explorer' | 'project' | 'tproject'` и конфиг `ProgramConfig { showBreadcrumbs: boolean; canNavigate: boolean; …}`.
2. В файлах `programs/{explorer,project,tproject}.ts` задать `config` для каждого режима.
3. В `Window/Content.vue` при рендере компонента программы — `provide('programMode', mode)` и `provide('programConfig', config)`.
4. В `Programs/Explorer/index.vue` — `const mode = inject('programMode')`, `const config = inject('programConfig')`. По `config` управлять:
   - `showBreadcrumbs` → рендерить `WindowHeaderBreadcrumbs`.
   - `canNavigate` → разрешать/запрещать переходы внутри.
5. Тест-кейс: открыть `/projects/griboyedov` (project mode) → специфичный UI, а `/about-me` (explorer mode) — дефолтный.

## Критерии готовности
- [ ] `explorer`, `project`, `tproject` используют один компонент.
- [ ] Поведение различается через `config`.
- [ ] Нет дублирующих `.vue` файлов.
- [ ] Playwright smoke все зелёные.

## Проверка
- Ручной: открыть по очереди все три типа — визуально разные, но рендерится один Explorer.
