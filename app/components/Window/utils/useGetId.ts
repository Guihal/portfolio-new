import { useWindowsStore } from "~/stores/windows";

export function useGetId() {
	const store = useWindowsStore();
	return (++store.counter).toString();
}
