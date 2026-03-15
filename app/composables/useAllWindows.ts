import type { WindowOb } from '~/components/Window/Window';

export type AllWindows = Record<string, WindowOb>;

const STATE_KEY = 'windows_all';
const COUNTER_KEY = 'windows_all_counter';

export const useAllWindows = () => {
    const allWindows = useState<AllWindows>(STATE_KEY, () => ({}));
    const allWindowsIdCounter = useState<number>(COUNTER_KEY, () => 0);

    return { allWindows, allWindowsIdCounter };
};

export const clearAllWindowsState = () => {
    const allWindows = useState<AllWindows>(STATE_KEY, () => ({}));
    const allWindowsIdCounter = useState<number>(COUNTER_KEY, () => 0);

    allWindows.value = {};
    allWindowsIdCounter.value = 0;
};
