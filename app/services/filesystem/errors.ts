// P8-03 — типизированные ошибки FsClient.
// Discriminator `kind` — для exhaustive switch в consumer'ах (composables).
// Без module-scope state (см. RULES.md §2a).

export class FsNotFoundError extends Error {
	readonly kind = "not-found" as const;
	readonly path: string;

	constructor(path: string, message?: string) {
		super(message ?? `Filesystem entry not found: ${path}`);
		this.name = "FsNotFoundError";
		this.path = path;
	}
}

export class FsServerError extends Error {
	readonly kind = "server" as const;
	readonly status?: number;

	constructor(message: string, status?: number, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "FsServerError";
		this.status = status;
	}
}

export class FsAbortedError extends Error {
	readonly kind = "aborted" as const;

	constructor(message = "Filesystem request aborted") {
		super(message);
		this.name = "FsAbortedError";
	}
}

export type FsError = FsNotFoundError | FsServerError | FsAbortedError;
