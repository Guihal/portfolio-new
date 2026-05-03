// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	time = 100,
): T {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return ((...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), time);
	}) as T;
}
