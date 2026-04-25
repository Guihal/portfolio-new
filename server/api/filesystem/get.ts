import { isError } from "h3";
import { ENTITY_CACHE_MAX_AGE } from "~~/server/utils/cacheLifetime";
import { notFound, serverError } from "~~/server/utils/errors";
import { getEntity } from "~~/server/utils/manifest";
import { parsePathQuery } from "~~/server/utils/validation";

export default defineCachedEventHandler(
	async (event) => {
		try {
			const { path } = parsePathQuery(getQuery(event));
			const entity = await getEntity(path);
			if (!entity) throw notFound("При открытии файла произошла ошибка");
			return { ...entity, path };
		} catch (e) {
			if (isError(e)) throw e;
			throw serverError(e);
		}
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
