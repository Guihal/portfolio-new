// P8-05 — константы slider (project program). Единая точка для tweaking
// drag threshold и click-vs-drag timing. RULES.md §4.3.

/** Пикселей — минимальное смещение pointer для начала drag. */
export const SLIDER_DRAG_THRESHOLD_PX = 40 as const;

/** Миллисекунд — если pointerdown→up меньше этого + мало движения → click. */
export const SLIDER_CLICK_MAX_MS = 300 as const;
