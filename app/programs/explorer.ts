import icon from "@/assets/icons/programs/explorer.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "explorer",
	label: "Проводник",
	icon,
	config: {
		showBreadcrumbs: true,
		canNavigate: true,
	},
	component: defineAsyncComponent(
		() => import("@/components/Programs/Explorer/index.vue"),
	),
};

export default program;
