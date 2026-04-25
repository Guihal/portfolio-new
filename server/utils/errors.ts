import { createError, type H3Error } from "h3";
import { logger } from "../../shared/utils/logger";

export function notFound(message = "Not Found"): H3Error {
	return createError({
		statusCode: 404,
		statusMessage: "Not Found",
		message,
	});
}

export function badRequest(message = "Bad Request"): H3Error {
	return createError({
		statusCode: 400,
		statusMessage: "Bad Request",
		message,
	});
}

export function serverError(
	err: unknown,
	message = "Internal Server Error",
): H3Error {
	logger.error("[server]", err);
	return createError({
		statusCode: 500,
		statusMessage: "Internal Server Error",
		message,
	});
}
