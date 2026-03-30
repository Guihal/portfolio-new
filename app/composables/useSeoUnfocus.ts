export async function useSeoUnfocus() {
    const { data } = useAsyncData(
        'entity-/',
        async () => {
            let resp = undefined;
            try {
                resp = await $fetch('/api/filesystem/get', {
                    method: 'POST',
                    body: {
                        path: '/',
                    },
                });
            } catch (err) {
                console.error(err);
            }

            return resp;
        },
        {
            immediate: true,
            server: true,
        },
    );

    watchEffect(() => {
        if (focusedWindowId.value) return;
        useSeoMeta({
            title: data.value?.name,
        });
    });
}
