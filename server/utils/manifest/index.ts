// P8-14: public surface — re-exports per-concern файлов. Сохраняет существующий
// import path `~~/server/utils/manifest` для consumer'ов (api endpoints, tests).
//
// Намеренно пустой barrel: re-export'ы getEntity/listChildren/getBreadcrumbs/
// findNode дублируют auto-import'ы Nitro (которые сканируют исходные файлы
// напрямую) и приводят к WARN "Duplicated imports" на каждом `nuxt prepare`.
// Консьюмеры импортируют из конкретных файлов:
//   import { getEntity } from "~~/server/utils/manifest/resolveEntity";
//   import { findNode } from "~~/server/utils/manifest/findNode";
//   import { scanTree } from "~~/server/utils/manifest/scanTree";
// Этот файл оставлен как single source of truth для manifest-public API.
export {};
