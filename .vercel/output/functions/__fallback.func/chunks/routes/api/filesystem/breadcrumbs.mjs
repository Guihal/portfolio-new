import { d as defineCachedEventHandler, C as CACHE_LIFETIME, r as readBody, g as getProtectedPath, B as BASEPATH, a as getEntity } from '../../../nitro/nitro.mjs';
import 'node:path';
import 'node:fs/promises';
import 'path';
import 'fs';
import 'node:url';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';
import 'ipx';

const breadcrumbs = defineCachedEventHandler(
  async (event) => {
    const body = await readBody(event);
    const path = body.path;
    const protectedPath = getProtectedPath(path);
    const relPath = protectedPath.replace(BASEPATH, "");
    const segments = relPath.split("/").filter(Boolean);
    const breadcrumbs = (await Promise.all(
      segments.map(async (_, i, arr) => {
        const segmentPath = "/" + arr.slice(0, i + 1).join("/");
        const entity = await getEntity(segmentPath);
        if (!entity) return void 0;
        return {
          path: segmentPath,
          entity
        };
      })
    )).filter(Boolean);
    return breadcrumbs;
  },
  {
    maxAge: CACHE_LIFETIME,
    getKey: async (event) => {
      const body = await readBody(event);
      return `breadcrumbs:${(body == null ? void 0 : body.path) || "default"}`;
    }
  }
);

export { breadcrumbs as default };
//# sourceMappingURL=breadcrumbs.mjs.map
