import { d as defineCachedEventHandler, C as CACHE_LIFETIME, r as readBody, c as createError, a as getEntity } from '../../../nitro/nitro.mjs';
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

const get = defineCachedEventHandler(
  async (event) => {
    const body = await readBody(event);
    const path = body.path;
    if (!path) {
      throw createError({
        statusCode: 400,
        statusMessage: '\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 "path" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D'
      });
    }
    const entity = await getEntity(path);
    if (!entity) {
      throw createError({
        statusCode: 404,
        statusMessage: "\u041F\u0440\u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0438 \u0444\u0430\u0439\u043B\u0430 \u043F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430"
      });
    }
    return entity;
  },
  {
    maxAge: CACHE_LIFETIME,
    getKey: async (event) => {
      const body = await readBody(event);
      return `entity:${(body == null ? void 0 : body.path) || "default"}`;
    }
  }
);

export { get as default };
//# sourceMappingURL=get.mjs.map
