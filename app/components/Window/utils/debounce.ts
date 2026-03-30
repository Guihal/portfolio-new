export function debounce(callback: (...args: any) => void, time = 100) {
    let timeout: any = null;

    return (...args: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), time);
    };
}
