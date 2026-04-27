// Тайминги UI-эффектов в миллисекундах. Единая точка для tweaking,
// иначе магические числа размазаны по composables/services и легко
// рассинхронизируются с дизайн-намерением.

// Задержка авто-fullscreen после drag-end. Маленькая (≈ frame), чтобы
// дать состоянию `fullscreen-ready` устаканиться перед записью.
export const FULLSCREEN_AUTO_SET_DELAY_MS = 10 as const;

// Hover-tooltip в taskbar: задержка перед скрытием, чтобы курсор успел
// перейти с кнопки на сам tooltip без мерцания.
export const TOOLTIP_HIDE_DELAY_MS = 150 as const;

// Debounce генерации превью окна (MutationObserver → html-to-image).
// Длинный, т.к. toJpeg тяжёлый и не нужен на каждое DOM-изменение.
export const PREVIEW_DEBOUNCE_MS = 500 as const;
