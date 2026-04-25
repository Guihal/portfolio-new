import { getBreadcrumbs } from "~~/server/utils/manifest";
import { parsePathQuery } from "~~/server/utils/validation";

export default defineEventHandler(async (event) => {
	const { path } = parsePathQuery(getQuery(event));
	return await getBreadcrumbs(path);
});
