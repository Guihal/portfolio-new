// composables/useIsMobile.ts
export const useIsMobile = () => {
    if (!import.meta.client) return false;
    return (
        matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
    );
};
