// Programs registry: re-exports + helpers. ProgramView теперь содержит
// `seo` (defaultDescription, defaultOgImage) — fallback для useWindowTitle
// когда entity.description не задан в entity.json.

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

export type ProgramSeo = {
	defaultDescription: string;
	defaultOgImage?: string;
};

export type ProgramView = Program & {
	id: ProgramType;
	label: string;
	icon: string;
	component: Component;
	config: ProgramConfig;
	seo: ProgramSeo;
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
