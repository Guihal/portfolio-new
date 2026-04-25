import { isError } from "h3";
import { ENTITY_CACHE_MAX_AGE } from "~~/server/utils/cacheLifetime";
import { serverError } from "~~/server/utils/errors";
import { listChildren } from "~~/server/utils/manifest";
import { parsePathQuery } from "~~/server/utils/validation";

export default defineCachedEventHandler(
	async (event) => {
		try {
			const { path } = parsePathQuery(getQuery(event));
			return await listChildren(path);
		} catch (e) {
			if (isError(e)) throw e;
			throw serverError(e);
		}
	},
	{
		name: "fs-list",
		maxAge: ENTITY_CACHE_MAX_AGE,
		getKey: (event) => {
			const q = getQuery(event);
			return `list:${typeof q.path === "string" ? q.path : "invalid"}`;
		},
	},
);
