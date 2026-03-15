/**
 * Composable для работы с путями окон.
 *
 * Предоставляет:
 * - hasPath(path) — проверка, существует ли уже окно с указанным путём
 *
 * @returns hasPath — функция проверки пути
 */
export const useWindowPaths = () => {
    const { allWindows } = useAllWindows();

    /**
     * Проверяет, существует ли уже окно с указанным путём.
     * Если существует — возвращает ID окна, иначе false.
     *
     * @param path - Путь файла для проверки
     * @returns ID окна | false
     */
    const hasPath = (path: string) => {
        for (const key in allWindows.value) {
            const typedKey = key as keyof AllWindows;
            if (allWindows!.value[typedKey]!.targetFile === path)
                return allWindows!.value[typedKey]!.id;
        }

        return false;
    };

    return {
        hasPath,
    };
};
