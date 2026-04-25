const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const isDev = process.env.NODE_ENV === "development";

export const MANIFEST_CACHE_MAX_AGE = isDev ? MINUTE : HOUR;
export const ENTITY_CACHE_MAX_AGE = isDev ? MINUTE : HOUR;
