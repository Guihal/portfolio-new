import icon from "@/assets/icons/programs/tproject.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
	id: "tproject",
	label: "Просмотр проектов на тильде",
	icon,
	extension: "tprjt",
	component: defineAsyncComponent(
		() => import("@/components/Programs/Explorer/index.vue"),
	),
};

export default program;
