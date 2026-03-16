import { d as defineCachedEventHandler, C as CACHE_LIFETIME, r as readBody, c as createError, b as getAllEntitiesByPath } from '../../../nitro/nitro.mjs';
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

const list = defineCachedEventHandler(
  async (event) => {
    const body = await readBody(event);
    const path = body.path;
    if (!path) {
      throw createError({
        statusCode: 400,
        statusMessage: '\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 "path" \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D'
      });
    }
    const fsFiles = await getAllEntitiesByPath(path);
    console.log(fsFiles, "\u0444\u0430\u0439\u043B\u0438\u0443\u043A\u0438");
    return fsFiles;
  },
  {
    maxAge: CACHE_LIFETIME,
    getKey: async (event) => {
      const body = await readBody(event);
      return `list:${(body == null ? void 0 : body.path) || "default"}`;
    }
  }
);

export { list as default };
//# sourceMappingURL=list.mjs.map
