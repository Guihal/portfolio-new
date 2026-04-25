import { serverError } from "~~/server/utils/errors";
import { listChildren } from "~~/server/utils/manifest";
import { parsePathQuery } from "~~/server/utils/validation";

export default defineEventHandler(async (event) => {
	const { path } = parsePathQuery(getQuery(event));
	try {
		return await listChildren(path);
	} catch (e) {
		throw serverError(e);
	}
});
