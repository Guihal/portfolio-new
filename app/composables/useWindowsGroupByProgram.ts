import type { ProgramType } from '~~/shared/types/Program';
import type { WindowOb } from '~/components/Window/Window';
import { PROGRAMS } from '~/utils/constants/PROGRAMS';
import { debounce } from '~/components/Window/utils/debounce';

const windowsGroupByProgram: Ref<Partial<Record<ProgramType, WindowOb[]>>> =
    ref({});

let initialized = false;

export const useWindowsGroupByProgram = () => {
    const { allWindows } = useAllWindows();

    if (!initialized) {
        initialized = true;

        watch(
            allWindows.value,
            debounce(() => {
                windowsGroupByProgram.value = {};

                for (const id in allWindows.value) {
                    const typedId = id as keyof AllWindows;

                    if (!allWindows.value[typedId]?.file) continue;

                    const typeProgram =
                        allWindows.value[typedId].file.programType;

                    if (!PROGRAMS[typeProgram]) continue;

                    if (!windowsGroupByProgram.value[typeProgram]) {
                        windowsGroupByProgram.value[typeProgram] = [];
                    }

                    windowsGroupByProgram.value[typeProgram]!.push(
                        allWindows.value[typedId],
                    );
                }
            }, 100),
            {
                immediate: true,
                deep: true,
            },
        );
    }

    return { windowsGroupByProgram };
};
