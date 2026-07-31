import { describe, expect, it } from "vitest";
import { formatMtime } from "~/utils/formatDate";

describe("formatMtime", () => {
	it("форматирует UTC ISO в DD.MM.YYYY HH:MM", () => {
		expect(formatMtime("2026-07-31T19:00:00Z")).toBe("31.07.2026 19:00");
	});

	it("добивает нулями день/месяц/час/минуту", () => {
		expect(formatMtime("2026-01-01T00:00:00Z")).toBe("01.01.2026 00:00");
	});

	it("использует UTC, не local TZ", () => {
		// 23:00 UTC = 02:00 следующего дня MSK. Если бы брали local, был бы
		// следующий день и час 02. Проверяем, что UTC побеждает.
		expect(formatMtime("2026-07-31T23:00:00Z")).toBe("31.07.2026 23:00");
	});
});
