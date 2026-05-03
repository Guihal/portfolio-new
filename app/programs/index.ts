import type { Component } from "vue";
import type { Program, ProgramType } from "~~/shared/types/filesystem";
import about from "./about";
import code from "./code";
import explorer from "./explorer";
import project from "./project";
import showcase from "./showcase";
import tproject from "./tproject";

export type ProgramMode = ProgramType;

export type ProgramConfig = {
	showBreadcrumbs: boolean;
	canNavigate: boolean;
};

export type ProgramView = Program & {
	id: ProgramType;
	label: string;
	icon: string;
	component: Component;
	config: ProgramConfig;
};

const REGISTRY: Partial<Record<ProgramType, ProgramView>> = {
	explorer,
	project,
	tproject,
	about,
	showcase,
	code,
};

export function getProgram(type: ProgramType): ProgramView | null {
	return REGISTRY[type] ?? null;
}

export function getAllPrograms(): Partial<Record<ProgramType, ProgramView>> {
	return REGISTRY;
}

export function hasProgram(type: ProgramType): boolean {
	return Object.hasOwn(REGISTRY, type);
}
