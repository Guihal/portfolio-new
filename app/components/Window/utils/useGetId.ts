export function useGetId() {
    const { allWindowsIdCounter } = useAllWindows();
    return (++allWindowsIdCounter.value).toString();
}
