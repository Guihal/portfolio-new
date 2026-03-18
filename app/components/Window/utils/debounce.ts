export function debounce(callback: () => void, time = 100) {
    let timeout: any = null;

    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(callback, time);
    };
}
