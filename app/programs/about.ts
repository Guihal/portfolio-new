import icon from "@/assets/icons/programs/about.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "about",
	label: "Информация о системе",
	icon,
	extension: "",
	config: {
		showBreadcrumbs: false,
		canNavigate: false,
	},
	component: defineAsyncComponent(
		() => import("@/components/Programs/About/index.vue"),
	),
};

export default program;
