import { isError } from "h3";
import { ENTITY_CACHE_MAX_AGE } from "~~/server/utils/cacheLifetime";
import { notFound, serverError } from "~~/server/utils/errors";
import { resolveContent } from "~~/server/utils/manifest/resolveContent";
import { parseContentPathQuery } from "~~/server/utils/validation";

export default defineCachedEventHandler(
	async (event) => {
		try {
			const { path } = parseContentPathQuery(getQuery(event));
			const content = await resolveContent(path);
			if (!content) throw notFound("Содержимое не найдено");
			return content;
		} catch (e) {
			if (isError(e)) throw e;
			throw serverError(e);
		}
	},
	{
		name: "fs-content",
		maxAge: ENTITY_CACHE_MAX_AGE,
		getKey: (event) => {
			const q = getQuery(event);
			return `content:${typeof q.path === "string" ? q.path : "invalid"}`;
		},
	},
);
