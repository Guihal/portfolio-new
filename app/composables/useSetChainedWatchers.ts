import type {
    WatchCallback,
    WatchHandle,
    WatchOptions,
    WatchSource,
} from 'vue';

// Хранит функции очистки для main и chained watchers
export type UseSetChainedWatchersCleaners = {
    main?: WatchHandle;
    chained?: WatchHandle;
};

// Тип watcher'а: [source, callback, options?]
export type UseSetChainedWatchersWatcher = [
    WatchSource<unknown>,
    WatchCallback<any, unknown>,
    WatchOptions?,
];

// Функция очистки для конкретного ключа
export type UseSetChainedWatchersCleaner = (
    key: keyof UseSetChainedWatchersCleaners,
) => void;

/**
 * Создаёт цепочку watchers: main watcher управляет созданием/удалением chained watcher.
 *
 * Логика:
 * - Когда getter возвращает true — создаётся chained watcher
 * - Когда getter возвращает false — chained watcher удаляется
 *
 * Пример использования:
 * - getter: () => windowOb.states.drag (создавать watcher только при drag)
 * - source: () => windowOb.bounds.target (следить за bounds только во время drag)
 *
 * @param getter - Условие активации chained watcher
 * @param source - Источник для chained watcher
 * @param callback - Callback для chained watcher
 * @param options - Опции для chained watcher
 * @param mainCallback - Callback для main watcher
 */
export function useSetChainedWatchers(
    getter: () => boolean,
    source: WatchSource<unknown>,
    callback: WatchCallback<any, unknown>,
    options: WatchOptions | undefined = undefined,
    mainCallback: (v: boolean) => void = () => {},
) {
    // Хранилище функций очистки
    const cleaners: UseSetChainedWatchersCleaners = {};

    // Очистка watcher'а по ключу
    const clean: UseSetChainedWatchersCleaner = (key) => {
        if (cleaners[key] === undefined) return;
        cleaners[key]();
        delete cleaners[key];
    };

    // Очистка всех watchers
    const cleanAll = () => {
        for (const key in cleaners) {
            const typedKey = key as keyof UseSetChainedWatchersCleaners;
            clean(typedKey);
        }
    };

    // Создание watcher'а (если ещё не создан)
    const create = (
        key: keyof UseSetChainedWatchersCleaners,
        ...args: UseSetChainedWatchersWatcher
    ) => {
        if (cleaners[key] !== undefined) return;
        cleaners[key] = watch(...args);
    };

    // Создаём main watcher — следит за условием активации
    create(
        'main',
        getter,
        (v) => {
            mainCallback(v);
            if (v) {
                // Условие истинно — создаём chained watcher
                create('chained', source, callback, options);
            } else {
                // Условие ложно — удаляем chained watcher
                clean('chained');
            }
        },
        { immediate: true },
    );

    // Очищаем все watchers при размонтировании
    onBeforeUnmount(() => {
        cleanAll();
    });

    return { cleanAll };
}
