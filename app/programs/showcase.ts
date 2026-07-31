import icon from "@/assets/icons/programs/project.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "showcase",
	label: "Showcase",
	icon,
	config: {
		showBreadcrumbs: true,
		canNavigate: false,
	},
	seo: {
		defaultDescription: "Скриншот проекта из портфолио Дмитрия Стаценко.",
	},
	component: defineAsyncComponent(
		() => import("@/components/Programs/Showcase/index.vue"),
	),
};

export default program;
