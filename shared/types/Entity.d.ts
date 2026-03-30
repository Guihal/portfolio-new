import type { ProgramType } from './Program';

export type Entity = {
    name: string;
    programType: ProgramType;
    hidden?: boolean;
};
