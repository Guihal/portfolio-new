import { PROGRAMS } from "~/utils/constants/programs";
import type { Entity, FsFile } from "~~/shared/types/filesystem";

export function useGetShortcut(fsFile: FsFile | Entity) {
	const isRegisteredFile = Object.hasOwn(PROGRAMS, fsFile.programType);
	const program = isRegisteredFile ? PROGRAMS[fsFile.programType] : null;
	const icon = program?.icon ?? null;
	const extention = program?.extension ?? null;

	let nameText = fsFile.name;
	if (extention) nameText += `.${extention}`;

	return { isRegisteredFile, icon, extention, nameText };
}
