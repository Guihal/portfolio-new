import type { Component } from "vue";
import type { Program, ProgramType } from "~~/shared/types/filesystem";
import about from "./about";
import explorer from "./explorer";
import project from "./project";
import tproject from "./tproject";

export type ProgramView = Program & {
	id: ProgramType;
	label: string;
	icon: string;
	component: Component;
};

const REGISTRY: Record<ProgramType, ProgramView> = {
	explorer,
	project,
	tproject,
	about,
};

export function getProgram(type: ProgramType): ProgramView | null {
	return REGISTRY[type] ?? null;
}

export function getAllPrograms(): Record<ProgramType, ProgramView> {
	return REGISTRY;
}

export function hasProgram(type: ProgramType): boolean {
	return Object.hasOwn(REGISTRY, type);
}
