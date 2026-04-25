import { isError } from "h3";
import { ENTITY_CACHE_MAX_AGE } from "~~/server/utils/cacheLifetime";
import { notFound, serverError } from "~~/server/utils/errors";
import { getBreadcrumbs } from "~~/server/utils/manifest";
import { parsePathQuery } from "~~/server/utils/validation";

export default defineCachedEventHandler(
	async (event) => {
		try {
			const { path } = parsePathQuery(getQuery(event));
			const breadcrumbs = await getBreadcrumbs(path);
			if (!breadcrumbs) throw notFound("Маршрут не найден");
			return breadcrumbs;
		} catch (e) {
			if (isError(e)) throw e;
			throw serverError(e);
		}
	},
	{
		name: "fs-breadcrumbs",
		maxAge: ENTITY_CACHE_MAX_AGE,
		getKey: (event) => {
			const q = getQuery(event);
			return `breadcrumbs:${typeof q.path === "string" ? q.path : "invalid"}`;
		},
	},
);
