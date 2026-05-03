// P8-13: barrel re-export для app/composables/. Auto-import Nuxt'а тянет
// функции напрямую из вложенных файлов, но index.ts даёт стабильную точку
// импорта для тестов и явных consumer'ов (group → namespace).

export * from "./global/useAppBootstrap";
export * from "./global/useViewportObserver";
export * from "./global/useWindowTitle";
export * from "./shared/useGetShortcut";
export * from "./window/useBatchedRef";
export * from "./window/useGridCells";
export * from "./window/useProgramFetch";
export * from "./window/useResizeObserver";
export * from "./window/useSeoUnfocus";
export * from "./window/useSetChainedWatchers";
export * from "./window/useTooltipState";
