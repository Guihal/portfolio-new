import type { ChainedKey } from './composables/useResizeForDirections';
import type { FsFile } from '~~/shared/types/FsFile';

export type WindowBounds = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export type WindowBoundsKey = keyof WindowBounds;

export type WindowState =
    | 'fullscreen'
    | 'fullscreen-ready'
    | 'collapsed'
    | 'drag'
    | 'resize'
    | 'loading'
    | 'error'
    | 'focused';

export type WindowResizeDirections = Partial<Record<ChainedKey, boolean>>;

export type WindowStates = Partial<Record<WindowState, true>>;
export type WindowFile = FsFile | null;
export type WindowOb = {
    id: string;
    bounds: {
        target: WindowBounds;
        calculated: WindowBounds;
    };
    states: WindowStates;
    targetFile: {
        value: string;
    };
    file: WindowFile;
    // content: ProgramInstance;
};
