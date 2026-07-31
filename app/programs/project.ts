import icon from "@/assets/icons/programs/project.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "project",
	label: "Просмотр проектов",
	icon,
	extension: "prjt",
	config: {
		showBreadcrumbs: true,
		canNavigate: true,
	},
	seo: {
		defaultDescription:
			"Проект из портфолио Дмитрия Стаценко: описание, стек, ссылки.",
	},
	component: defineAsyncComponent(
		() => import("@/components/Programs/Project/index.vue"),
	),
};

export default program;
