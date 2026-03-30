import { useCreateAndRegisterWindow } from './useCreateAndRegisterWindow';

export async function useCreateWindowByPath(path: string) {
    let entity = undefined;
    try {
        entity = await $fetch('/api/filesystem/get', {
            responseType: 'json',
            method: 'POST',
            body: {
                path,
            },
        });
    } catch (err) {
        console.error(err);
    }

    if (!entity) {
        console.error('Не найдено по такому пути окна');
    }

    let file = {
        path,
    };

    if (entity) {
        file = {
            ...file,
            ...entity,
        };
    }

    try {
        useCreateAndRegisterWindow(file);
    } catch (e) {
        console.error(e);
    }

    return true;
}
