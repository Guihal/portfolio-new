// Trailing-slash normalization: /about/ → 301 /about.
// Тонкая h3-обёртка над чистой normalizeTrailingSlashPath (server/utils).

import { sendRedirect } from "h3";
import { normalizeTrailingSlashPath } from "~~/server/utils/trailingSlash";

export default defineEventHandler((event) => {
	const url = getRequestURL(event);
	const target = normalizeTrailingSlashPath(url.pathname);
	if (!target) return;
	return sendRedirect(event, `${target}${url.search}`, 301);
});
