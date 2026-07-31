import hhIcon from "~/assets/icons/socials/hh.svg?raw";
import maxIcon from "~/assets/icons/socials/max.svg?raw";
import telegramIcon from "~/assets/icons/socials/telegram.svg?raw";
import type { SocialLink } from "~~/shared/types/filesystem";

// Единый источник для таскбар-трея (Taskbar/Socials.vue) и About-панели
// (Programs/About/Profile.vue).
//
// Контракт заменяемых SVG в app/assets/icons/socials/:
// - fill="currentColor" — цвет задаёт CSS-контекст: c('main') в таскбаре,
//   c('default-contrast') → hover c('accent') в About. Хардкод цвета ломает hover.
// - квадратный viewBox обязателен;
// - БЕЗ width/height на <svg> — размер задаёт CSS (30px таскбар / 20px About).
export const SOCIAL_LINKS: SocialLink[] = [
	{
		id: "telegram",
		label: "Telegram",
		url: "https://t.me/dungeonmastergui",
		icon: telegramIcon,
	},
	{
		id: "max",
		label: "Max",
		url: "https://max.ru/u/f9LHodD0cOJG7lwFjRye8HQgCq9hPHv9VdGYnTrfr03yqsbjIlUV1byAzEw",
		icon: maxIcon,
	},
	{
		id: "hh",
		label: "hh.ru",
		url: "https://hh.ru/resume/f8e162dbff1047f4020039ed1f733966577173",
		icon: hhIcon,
	},
];
