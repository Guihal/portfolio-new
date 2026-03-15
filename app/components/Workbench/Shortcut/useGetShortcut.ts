import { PROGRAMS } from '~/utils/constants/PROGRAMS';
import type { File } from '~~/shared/types/File';
import { ALLPROGRAMS } from '~~/shared/utils/Programs/All';

export function useGetShortcut(fsFile: File) {
    const isRegisteredFile = Object.hasOwn(PROGRAMS, fsFile.programType);

    const icon = !isRegisteredFile ? null : PROGRAMS[fsFile.programType]?.icon;
    const extention = !isRegisteredFile
        ? null
        : PROGRAMS[fsFile.programType]?.extension;

    let nameText = fsFile.name;

    if (extention) {
        nameText += `.${extention}`;
    }

    return {
        isRegisteredFile,
        icon,
        extention,
        nameText,
    };
}
