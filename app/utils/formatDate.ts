// UTC-формат даты изменения файла (DD.MM.YYYY HH:MM).
// Используем UTC, чтобы избежать SSR/CSR hydration mismatch: useAsyncData
// рендерится и на сервере, и на клиенте — local TZ дал бы рассинхрон.
export function formatMtime(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
