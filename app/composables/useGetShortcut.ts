import { getProgram, hasProgram } from "~/programs";
import type { Entity, FsFile } from "~~/shared/types/filesystem";

export function useGetShortcut(fsFile: FsFile | Entity) {
	const isRegisteredFile = hasProgram(fsFile.programType);
	const program = isRegisteredFile ? getProgram(fsFile.programType) : null;
	const icon = program?.icon ?? null;
	const extention = program?.extension ?? null;

	let nameText = fsFile.name;
	if (extention) nameText += `.${extention}`;

	return { isRegisteredFile, icon, extention, nameText };
}
