// P0-06: глобалы Nitro для импорта server/utils в unit-тестах.
import { vi } from "vitest";

(globalThis as any).useStorage = () => ({
	getItem: async () => null,
});

(globalThis as any).createError = (e: {
	statusCode?: number;
	statusMessage?: string;
}) => {
	const err = new Error(e.statusMessage ?? "error");
	(err as any).statusCode = e.statusCode;
	return err;
};

(globalThis as any).defineCachedFunction = (fn: any) => fn;
(globalThis as any).defineCachedEventHandler = (fn: any) => fn;

export { vi };
