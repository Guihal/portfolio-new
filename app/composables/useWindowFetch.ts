import { useWindowLoading } from '~/components/Window/composables/useWindowLoading';

export function useWindowFetch(windowObId: string) {
    const isLoading = ref(false);
    const { register } = useWindowLoading();
    register(windowObId, isLoading);

    const windowFetch = async <T>(
        callback: () => Promise<T>,
    ): Promise<T | undefined> => {
        isLoading.value = true;
        let result: T | undefined;

        try {
            result = await callback();
        } catch (err) {
            console.error(err);
        } finally {
            isLoading.value = false;
        }

        return result;
    };

    return { isLoading, windowFetch };
}
