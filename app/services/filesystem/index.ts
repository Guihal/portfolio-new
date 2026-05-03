// P8-03 — публичный API filesystem-сервиса.
// См. docs/refactor/P8-03-filesystem-client.md, docs/RULES.md §2a (SSR-контракт).

export * from "./errors";
export { FsClient } from "./FsClient";
export { isFsFile, parseFsFile } from "./parseEntity";
