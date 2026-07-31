// robots.txt: server route (а не public/robots.txt), чтобы ссылаться на
// динамический origin из запроса (Sitemap host нельзя хардкодить для
// self-host с произвольным доменом). Content-Type=text/plain по RFC 9309.

import { setResponseHeader } from "h3";

export default defineEventHandler((event) => {
	setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
	const url = new URL(getRequestURL(event));
	const origin = url.origin;
	return `User-Agent: *
Allow: /
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;
});
