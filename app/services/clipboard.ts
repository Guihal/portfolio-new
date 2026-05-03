// Pure-ish clipboard service — no Vue refs, returns Promise<boolean>.
// SSR-safe: guards all window/document access.

/**
 * Copy text to clipboard with fallback chain:
 * 1. navigator.clipboard.writeText (modern, requires secure context)
 * 2. document.execCommand('copy') (legacy fallback)
 *
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (typeof window === "undefined") return false;

	if (window.navigator?.clipboard?.writeText) {
		try {
			await window.navigator.clipboard.writeText(text);
			return true;
		} catch {
			/* fallthrough */
		}
	}

	try {
		const ta = document.createElement("textarea");
		ta.value = text;
		ta.style.position = "fixed";
		ta.style.opacity = "0";
		document.body.appendChild(ta);
		ta.select();
		const ok = document.execCommand("copy");
		document.body.removeChild(ta);
		return ok;
	} catch {
		return false;
	}
}

/**
 * Check if any clipboard mechanism is available.
 */
export function isClipboardAvailable(): boolean {
	return (
		typeof window !== "undefined" &&
		(!!window.navigator?.clipboard?.writeText ||
			typeof document?.execCommand === "function")
	);
}
