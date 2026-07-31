import icon from "@/assets/icons/programs/project.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "code",
	label: "Код",
	icon,
	extension: "",
	config: {
		showBreadcrumbs: true,
		canNavigate: false,
	},
	seo: {
		defaultDescription: "Сниппет кода из портфолио Дмитрия Стаценко.",
	},
	component: defineAsyncComponent(
		() => import("@/components/Programs/Code/index.vue"),
	),
};

export default program;
