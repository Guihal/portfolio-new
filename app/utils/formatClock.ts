// Форматирование времени для таскбар-часов. Pure: без Vue/DOM, тестируется
// без mount. Intl через toLocale* — нативный, date-библиотеки не нужны.

export type ClockParts = {
	time: string;
	date: string;
};

export function formatClock(now: Date): ClockParts {
	return {
		time: now.toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		date: now.toLocaleDateString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}),
	};
}
