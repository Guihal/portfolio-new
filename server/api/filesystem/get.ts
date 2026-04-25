import { ENTITY_CACHE_MAX_AGE } from "~~/server/utils/cacheLifetime";
import { notFound } from "~~/server/utils/errors";
import { getEntity } from "~~/server/utils/manifest";
import { parsePathQuery } from "~~/server/utils/validation";

export default defineCachedEventHandler(
	async (event) => {
		const { path } = parsePathQuery(getQuery(event));
		const entity = await getEntity(path);

		if (!entity) {
			throw notFound("При открытии файла произошла ошибка");
		}

		return { ...entity, path };
	},
	{
		name: "fs-get",
		maxAge: ENTITY_CACHE_MAX_AGE,
		getKey: (event) => {
			const q = getQuery(event);
			return `entity:${typeof q.path === "string" ? q.path : "invalid"}`;
		},
	},
);
