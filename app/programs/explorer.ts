import icon from "@/assets/icons/programs/explorer.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "explorer",
	label: "Проводник",
	icon,
	component: defineAsyncComponent(
		() => import("@/components/Programs/Explorer/index.vue"),
	),
};

export default program;
