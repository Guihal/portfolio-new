import type { Program, ProgramType } from '~~/shared/types/Program';

export const ALLPROGRAMS: Record<ProgramType, Program> = {
    explorer: {},
    project: {
        extension: 'prjt',
    },
    tproject: {
        extension: 'tprjt',
    },
};
