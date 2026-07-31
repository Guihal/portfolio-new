import { describe, expect, it } from "vitest";
import { formatClock } from "~/utils/formatClock";

describe("formatClock", () => {
	// Строки целиком не сравниваем: разделитель и порядок зависят от ICU-версии.
	it("отдаёт время в HH:MM", () => {
		const { time } = formatClock(new Date(2026, 6, 28, 9, 5));

		expect(time).toMatch(/^\d{2}:\d{2}$/);
		expect(time).toContain("09");
		expect(time).toContain("05");
	});

	it("отдаёт дату с днём, месяцем и годом", () => {
		const { date } = formatClock(new Date(2026, 6, 28, 9, 5));

		expect(date).toContain("28");
		expect(date).toContain("07");
		expect(date).toContain("2026");
	});
});
