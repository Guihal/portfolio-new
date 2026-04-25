import icon from "@/assets/icons/programs/project.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "project",
	label: "Просмотр проектов",
	icon,
	extension: "prjt",
	component: defineAsyncComponent(
		() => import("@/components/Programs/Explorer/index.vue"),
	),
};

export default program;
