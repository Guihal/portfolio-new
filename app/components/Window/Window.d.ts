import type { ChainedKey } from './composables/useResizeForDirections';
import type { FsFile } from '~~/shared/types/FsFile';
import type { WindowBoundsKey } from '~/composables/useWindowBounds';

export type WindowState =
    | 'fullscreen'
    | 'fullscreen-ready'
    | 'collapsed'
    | 'drag'
    | 'resize'
    | 'loading'
    | 'error'
    | 'focused'
    | 'preview';

export type WindowResizeDirections = Partial<Record<ChainedKey, boolean>>;

export type WindowStates = Partial<Record<WindowState, true>>;
export type WindowFile = FsFile | null;
export type WindowOb = {
    id: string;
    states: WindowStates;
    targetFile: {
        value: string;
    };
    file: WindowFile;
};
