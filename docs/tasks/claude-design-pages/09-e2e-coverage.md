# Task 09: e2e-coverage

## Goal
Добавить Playwright e2e suite для всех новых программ + regression suite для existing (после migration task 04). Smoke + happy path + edge case coverage.

## Files (touch only)
- `tests/e2e/programs/project.spec.ts` (новый, ~70 LOC).
- `tests/e2e/programs/showcase.spec.ts` (новый, ~50 LOC).
- `tests/e2e/programs/code.spec.ts` (новый, ~80 LOC).
- `tests/e2e/programs/cascade.spec.ts` (новый, ~60 LOC).
- `tests/e2e/existing-projects.spec.ts` (новый, ~50 LOC) — regression для griboyedov/u24/about.

**Total LOC**: ~310 across 5 files. tests/** whitelist allows 400 LOC per file (RULES.md §3.2).

## Dependencies
- Tasks: 04, 05, 06, 07, 08, 10 (последний — fixtures для real content).
- Reads (без изменений):
  - `tests/e2e/*.spec.ts` — pattern reference.
  - `playwright.config.ts`.

## Steps

### Шаг 1 — `existing-projects.spec.ts` (regression)
```ts
import { test, expect } from '@playwright/test';

test.describe('existing projects regression', () => {
  test('/projects/u24 renders explorer view', async ({ page }) => {
    await page.goto('/projects/u24');
    await expect(page.locator('[data-testid="window-projects/u24"]')).toBeVisible();
    await expect(page.getByText('u24')).toBeVisible();
  });

  test('/projects/griboyedov renders explorer view', async ({ page }) => {
    await page.goto('/projects/griboyedov');
    await expect(page.getByText('Фонд имени Грибоедова')).toBeVisible();
  });

  test('/about renders about program', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('[data-testid="window-about"]')).toBeVisible();
  });

  test('migrated entity exposes new fields via content endpoint', async ({ request }) => {
    const r = await request.get('/api/filesystem/content?path=projects/u24');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.entity.year).toBeDefined();
    expect(Array.isArray(body.entity.tags)).toBe(true);
  });
});
```

### Шаг 2 — `project.spec.ts`
```ts
test.describe('project program', () => {
  // pre-condition: fixture entity или task 10 fixtures
  // ИЛИ skip если no images yet
  test('renders slider + meta panel', async ({ page }) => {
    await page.goto('/projects/griboyedov');  // если programType=project after experiment migration
    await expect(page.locator('.project__slider')).toBeVisible();
    await expect(page.locator('.project__meta')).toBeVisible();
  });

  test('next/prev buttons navigate slides', async ({ page }) => {
    await page.goto('/projects/griboyedov');
    const counter = page.locator('.project__nav span');
    await expect(counter).toContainText('1 /');
    await page.locator('.project__nav button').last().click();  // next
    await expect(counter).toContainText('2 /');
  });

  test('mobile viewport swaps to column-reverse', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 760 });
    await page.goto('/projects/griboyedov');
    const project = page.locator('.project');
    const flexDirection = await project.evaluate(el => getComputedStyle(el).flexDirection);
    // Container queries on window — assert column-reverse activated
    expect(['column-reverse', 'column']).toContain(flexDirection);
  });

  test('empty state when no images', async ({ page }) => {
    await page.goto('/projects/empty-fixture');  // fixture entity без images/
    await expect(page.locator('.project__empty')).toBeVisible();
  });

  test('error state on fetch failure', async ({ page }) => {
    await page.route('**/api/filesystem/content**', r => r.abort('failed'));
    await page.goto('/projects/griboyedov');
    await expect(page.locator('.project__error')).toBeVisible();
  });
});
```

### Шаг 3 — `showcase.spec.ts`
```ts
test.describe('showcase program', () => {
  test('deep image path opens showcase window', async ({ page }) => {
    await page.goto('/projects/griboyedov/01-cover.png');
    await expect(page.locator('.showcase__img')).toBeVisible();
  });

  test('non-existent image shows error', async ({ page }) => {
    await page.goto('/projects/griboyedov/does-not-exist.png');
    await expect(page.locator('.showcase__error')).toBeVisible();
  });

  test('aspect ratio preserved (object-fit: contain)', async ({ page }) => {
    await page.goto('/projects/griboyedov/01-cover.png');
    const objectFit = await page.locator('.showcase__img').evaluate(el => getComputedStyle(el).objectFit);
    expect(objectFit).toBe('contain');
  });
});
```

### Шаг 4 — `code.spec.ts`
```ts
test.describe('code program', () => {
  test('opens with first snippet by default', async ({ page }) => {
    await page.goto('/projects/griboyedov/code');
    await expect(page.locator('.code__pre')).toBeVisible();
  });

  test('explicit snippet id loads correct snippet', async ({ page }) => {
    await page.goto('/projects/griboyedov/code/marquee');
    await expect(page.locator('.code__title')).toContainText('marquee');
  });

  test('tabs switch active file', async ({ page }) => {
    await page.goto('/projects/griboyedov/code/marquee');
    const tabs = page.locator('.code__tabs li');
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/active/);
  });

  test('copy button writes to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/projects/griboyedov/code/marquee');
    await page.locator('.code__copy').click();
    await expect(page.locator('.code__copy.copied')).toBeVisible();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('<');  // sanity check — какой-то HTML/CSS/JS код
  });

  test('script payload not executed (XSS guard)', async ({ page }) => {
    // fixture с source `<script>window.__pwned=true</script>`
    await page.goto('/projects/xss-fixture/code/payload');
    const pwned = await page.evaluate(() => (window as any).__pwned);
    expect(pwned).toBeUndefined();
    // assert source виден как text
    await expect(page.locator('.code__pre code')).toContainText('<script>');
  });

  test('disabled state when clipboard unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-ignore
      delete window.navigator.clipboard;
      // @ts-ignore
      delete document.execCommand;
    });
    await page.goto('/projects/griboyedov/code/marquee');
    const btn = page.locator('.code__copy');
    await expect(btn).toBeDisabled();
  });
});
```

### Шаг 5 — `cascade.spec.ts`
```ts
test.describe('cascade layout', () => {
  test('opens N code windows from codeWindows.json', async ({ page }) => {
    await page.goto('/projects/griboyedov/code-cascade');  // или alternative trigger
    const windows = page.locator('[data-window-program="code"]');
    await expect(windows).toHaveCount(2);  // marquee + cookie-banner
  });

  test('cascade offset 24x14', async ({ page }) => {
    await page.goto('/projects/griboyedov/code-cascade');
    const windows = page.locator('[data-window-program="code"]');
    const first = await windows.first().boundingBox();
    const second = await windows.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(second!.x - first!.x).toBe(24);
    expect(second!.y - first!.y).toBe(14);
  });

  test('last window has focus', async ({ page }) => {
    await page.goto('/projects/griboyedov/code-cascade');
    const windows = page.locator('[data-window-program="code"]');
    await expect(windows.last()).toHaveAttribute('data-focused', 'true');
  });
});
```

## Success criteria
- `bun run test:e2e` зелёный.
- Все existing routes (regression) работают после migration.
- Все 3 новых программы покрыты smoke + happy path + 1 edge case минимум.
- XSS guard verified — script payload не выполняется.
- Clipboard test работает с granted permissions.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run test:e2e -- programs/   # все новые
bun run test:e2e -- existing-projects
bun run test:e2e               # full suite
```

## Acceptance test
Все Playwright tests зелёные на 3 viewport sizes (1280×760, 980×620, 420×760).

## Notes
- LOC ≤ 400 per file (tests whitelist).
- `noUncheckedIndexedAccess`: для `boundingBox()` — `Promise<{ x, y, width, height } | null>` → null-check обязателен.
- SSR: e2e тестирует full Nuxt SSR + hydration через Playwright headless browser.
- ESLint: tests exempt от `max-lines`. Использовать `expect.poll` для async assertions если нужно.
- **Fixture dependencies**: `xss-fixture`, `empty-fixture` — добавить в task 10 либо как часть e2e setup. Решение: prefer task 10 (real fixtures), e2e просто consumer'ы.
- **`data-testid`** / `data-window-program` attributes — должны быть выставлены в Window/index.vue (existing) или добавлены в task 05/07. Pre-req: проверить существующий markup, добавить data-attrs если нет.
- **Clipboard permissions** в Playwright: `context.grantPermissions(['clipboard-read', 'clipboard-write'])`.
- **Visual diff** против `claude-design/screenshots/*.png` — НЕ автоматизируется в этом таске (требует Percy/visual-regression — beyond MVP). Manual visual check в acceptance.

## Backward-compat
- Existing tests/e2e/ files — не трогаем (regression в отдельном файле existing-projects.spec.ts).
- `playwright.config.ts` — без изменений.

## Out of scope
- Visual regression (Percy/Argos).
- Performance benchmarks (Lighthouse).
- Accessibility audit (axe-core) — future PR.
- Cross-browser (только Chromium по существующему playwright.config).
