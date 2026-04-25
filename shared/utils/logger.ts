type LogArgs = readonly unknown[];

const IS_PROD: boolean = process.env.NODE_ENV === "production";

function debugGate(): boolean {
	if (!IS_PROD) return true;
	try {
		return Boolean(useRuntimeConfig().public.enableDebugLogs);
	} catch {
		return false;
	}
}

export const logger = {
	debug(...args: LogArgs): void {
		if (debugGate()) console.debug(...args);
	},
	info(...args: LogArgs): void {
		console.info(...args);
	},
	warn(...args: LogArgs): void {
		console.warn(...args);
	},
	error(...args: LogArgs): void {
		console.error(...args);
	},
};
