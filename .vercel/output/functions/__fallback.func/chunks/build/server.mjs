import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, inject, defineComponent, computed, unref, shallowRef, ref, reactive, toValue, getCurrentInstance, onServerPrefetch, toRef, isRef, defineAsyncComponent, withAsyncContext, mergeProps, watch, nextTick, createVNode, resolveDynamicComponent, createElementBlock, provide, cloneVNode, h, Suspense, shallowReactive, useSSRContext, createApp, withCtx, onErrorCaptured, effectScope, getCurrentScope, isReadonly, toRaw, isShallow, isReactive } from 'vue';
import { o as parseURL, q as encodePath, s as decodePath, t as hasProtocol, v as isScriptProtocol, m as joinURL, w as withQuery, x as sanitizeStatusCode, y as getContext, z as defu, c as createError$1, $ as $fetch$1, A as baseURL, D as createHooks, E as executeAsync } from '../nitro/nitro.mjs';
import { setActivePinia, createPinia, shouldHydrate } from 'pinia';
import { useRoute as useRoute$1, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { ssrRenderList, ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderVNode, ssrRenderSuspense } from 'vue/server-renderer';
import { debounce } from 'perfect-debounce';
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

const ALLPROGRAMS = {
  explorer: {},
  project: {
    extension: "prjt"
  },
  tproject: {
    extension: "tprjt"
  }
};

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "deep": false };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.3.1";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher().map((r) => r.data).reverse());
const routeRulesMatcher$1 = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher$1(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !shouldHydrate(data) && 1
  );
});
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
const _routes = [
  {
    name: "path",
    path: "/:path(.*)*",
    component: () => import('./_...path_-CrQrKjZj.mjs')
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    const hookToWait = nuxtApp._runningTransition ? "page:transition:finish" : "page:loading:end";
    return new Promise((resolve) => {
      if (from === START_LOCATION) {
        resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour));
        return;
      }
      nuxtApp.hooks.hookOnce(hookToWait, () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  const isPageNavigation = isChangingPage(to, from);
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isPageNavigation ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      if (to.matched.at(-1)?.components?.default === from.matched.at(-1)?.components?.default) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    if (!nuxtApp.ssrContext?.islandContext) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function useAsyncData(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (_isAutoKeyNeeded(args[0], args[1])) {
    args.unshift(autoKey);
  }
  let [_key, _handler, options = {}] = args;
  const key = computed(() => toValue(_key));
  if (typeof key.value !== "string") {
    throw new TypeError("[nuxt] [useAsyncData] key must be a string.");
  }
  if (typeof _handler !== "function") {
    throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");
  }
  const nuxtApp = useNuxtApp();
  options.server ??= true;
  options.default ??= getDefault;
  options.getCachedData ??= getDefaultCachedData;
  options.lazy ??= false;
  options.immediate ??= true;
  options.deep ??= asyncDataDefaults.deep;
  options.dedupe ??= "cancel";
  options._functionName || "useAsyncData";
  nuxtApp._asyncData[key.value];
  function createInitialFetch() {
    const initialFetchOptions = { cause: "initial", dedupe: options.dedupe };
    if (!nuxtApp._asyncData[key.value]?._init) {
      initialFetchOptions.cachedData = options.getCachedData(key.value, nuxtApp, { cause: "initial" });
      nuxtApp._asyncData[key.value] = createAsyncData(nuxtApp, key.value, _handler, options, initialFetchOptions.cachedData);
    }
    return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
  }
  const initialFetch = createInitialFetch();
  const asyncData = nuxtApp._asyncData[key.value];
  asyncData._deps++;
  const fetchOnServer = options.server !== false && nuxtApp.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxtApp.hook("app:created", async () => {
        await promise;
      });
    }
  }
  const asyncReturn = {
    data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
    pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
    status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
    error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
    refresh: (...args2) => {
      if (!nuxtApp._asyncData[key.value]?._init) {
        const initialFetch2 = createInitialFetch();
        return initialFetch2();
      }
      return nuxtApp._asyncData[key.value].execute(...args2);
    },
    execute: (...args2) => asyncReturn.refresh(...args2),
    clear: () => {
      const entry2 = nuxtApp._asyncData[key.value];
      if (entry2?._abortController) {
        try {
          entry2._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
        } finally {
          entry2._abortController = void 0;
        }
      }
      clearNuxtDataByKey(nuxtApp, key.value);
    }
  };
  const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
  Object.assign(asyncDataPromise, asyncReturn);
  return asyncDataPromise;
}
function writableComputedRef(getter) {
  return computed({
    get() {
      return getter()?.value;
    },
    set(value) {
      const ref2 = getter();
      if (ref2) {
        ref2.value = value;
      }
    }
  });
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
  if (typeof keyOrFetcher === "string") {
    return false;
  }
  if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) {
    return false;
  }
  if (typeof keyOrFetcher === "function" && typeof fetcher === "function") {
    return false;
  }
  return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = void 0;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
    nuxtApp._asyncData[key].error.value = void 0;
    nuxtApp._asyncData[key].status.value = "idle";
  }
  if (key in nuxtApp._asyncDataPromises) {
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function createAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
  nuxtApp.payload._errors[key] ??= void 0;
  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
  const handler = _handler ;
  const _ref = options.deep ? ref : shallowRef;
  const hasCachedData = initialCachedData !== void 0;
  const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
    if (!keys || keys.includes(key)) {
      await asyncData.execute({ cause: "refresh:hook" });
    }
  });
  const asyncData = {
    data: _ref(hasCachedData ? initialCachedData : options.default()),
    pending: computed(() => asyncData.status.value === "pending"),
    error: toRef(nuxtApp.payload._errors, key),
    status: shallowRef("idle"),
    execute: (...args) => {
      const [_opts, newValue = void 0] = args;
      const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
      if (nuxtApp._asyncDataPromises[key]) {
        if ((opts.dedupe ?? options.dedupe) === "defer") {
          return nuxtApp._asyncDataPromises[key];
        }
      }
      {
        const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
        if (cachedData !== void 0) {
          nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
          asyncData.error.value = void 0;
          asyncData.status.value = "success";
          return Promise.resolve(cachedData);
        }
      }
      if (asyncData._abortController) {
        asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
      }
      asyncData._abortController = new AbortController();
      asyncData.status.value = "pending";
      const cleanupController = new AbortController();
      const promise = new Promise(
        (resolve, reject) => {
          try {
            const timeout = opts.timeout ?? options.timeout;
            const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
            if (mergedSignal.aborted) {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
              return;
            }
            mergedSignal.addEventListener("abort", () => {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
            }, { once: true, signal: cleanupController.signal });
            return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
          } catch (err) {
            reject(err);
          }
        }
      ).then(async (_result) => {
        let result = _result;
        if (options.transform) {
          result = await options.transform(_result);
        }
        if (options.pick) {
          result = pick(result, options.pick);
        }
        nuxtApp.payload.data[key] = result;
        asyncData.data.value = result;
        asyncData.error.value = void 0;
        asyncData.status.value = "success";
      }).catch((error) => {
        if (nuxtApp._asyncDataPromises[key] && nuxtApp._asyncDataPromises[key] !== promise) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (asyncData._abortController?.signal.aborted) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
          asyncData.status.value = "idle";
          return nuxtApp._asyncDataPromises[key];
        }
        asyncData.error.value = createError(error);
        asyncData.data.value = unref(options.default());
        asyncData.status.value = "error";
      }).finally(() => {
        cleanupController.abort();
        delete nuxtApp._asyncDataPromises[key];
      });
      nuxtApp._asyncDataPromises[key] = promise;
      return nuxtApp._asyncDataPromises[key];
    },
    _execute: debounce((...args) => asyncData.execute(...args), 0, { leading: true }),
    _default: options.default,
    _deps: 0,
    _init: true,
    _hash: void 0,
    _off: () => {
      unsubRefreshAsyncData();
      if (nuxtApp._asyncData[key]?._init) {
        nuxtApp._asyncData[key]._init = false;
      }
      if (!hasCustomGetCachedData) {
        nextTick(() => {
          if (!nuxtApp._asyncData[key]?._init) {
            clearNuxtDataByKey(nuxtApp, key);
            asyncData.execute = () => Promise.resolve();
          }
        });
      }
    }
  };
  return asyncData;
}
const getDefault = () => void 0;
const getDefaultCachedData = (key, nuxtApp, ctx) => {
  if (nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key];
  }
  if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") {
    return nuxtApp.static.data[key];
  }
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
  const list = signals.filter((s) => !!s);
  if (typeof timeout === "number" && timeout >= 0) {
    const timeoutSignal = AbortSignal.timeout?.(timeout);
    if (timeoutSignal) {
      list.push(timeoutSignal);
    }
  }
  if (AbortSignal.any) {
    return AbortSignal.any(list);
  }
  const controller = new AbortController();
  for (const sig of list) {
    if (sig.aborted) {
      const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
      try {
        controller.abort(reason);
      } catch {
        controller.abort();
      }
      return controller.signal;
    }
  }
  const onAbort = () => {
    const abortedSignal = list.find((s) => s.aborted);
    const reason = abortedSignal?.reason ?? new DOMException("Aborted", "AbortError");
    try {
      controller.abort(reason);
    } catch {
      controller.abort();
    }
  };
  for (const sig of list) {
    sig.addEventListener?.("abort", onAbort, { once: true, signal: cleanupSignal });
  }
  return controller.signal;
}
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    setActivePinia(pinia);
    if (nuxtApp.payload && nuxtApp.payload.pinia) {
      pinia.state.value = nuxtApp.payload.pinia;
    }
    return {
      provide: {
        pinia
      }
    };
  },
  hooks: {
    "app:rendered"() {
      const nuxtApp = useNuxtApp();
      nuxtApp.payload.pinia = toRaw(nuxtApp.$pinia).state.value;
      setActivePinia(void 0);
    }
  }
});
const components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  payloadPlugin,
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin$1,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  plugin,
  components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8
];
const layouts = {
  default: defineAsyncComponent(() => import('./default-C2tXp0XM.mjs').then((m) => m.default || m))
};
const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0$7 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path).appLayout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = layout.value && layout.value in layouts;
      const transitionProps = route?.meta.layoutTransition ?? appLayoutTransition;
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(hasLayout && transitionProps, {
        default: () => h(Suspense, { suspensible: true, onResolve: () => {
          nextTick(done);
        } }, {
          default: () => h(
            LayoutProvider,
            {
              layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
              key: layout.value || void 0,
              name: layout.value,
              shouldProvide: !props.name,
              isRenderingNewLayout: (name) => {
                return name !== previouslyRenderedLayout && name === layout.value;
              },
              hasTransition: !!transitionProps
            },
            context.slots
          )
        })
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => name === false || name === (route.meta.layout ?? routeRulesMatcher(route.path).appLayout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const PROGRAMS = {
  explorer: {
    label: "Проводник",
    icon: `<svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34 0V2H36V4H38V6H56V12H50V18H56V12H62V6H66V8H68V10H70V66H68V68H66V70H4V68H2V66H0V4H2V2H4V0H34ZM56 48H50V54H62V42H56V48ZM56 36H50V42H56V36H62V30H56V36ZM56 24H50V30H56V24H62V18H56V24Z" fill="var(--icon-color)"/></svg>`,
    component: defineAsyncComponent(
      () => import('./index-jhtb02nG.mjs')
    ),
    ...ALLPROGRAMS.explorer
  },
  project: {
    label: "Просмотр проектов",
    icon: `<svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M66 0V2H68V4H70V66H68V68H66V70H4V68H2V66H0V4H2V2H4V0H66ZM26 21H25V23H24V24H23V26H22V28H21V29H20V31H19V33H18V35H17V36H16V38H15V40H14V42H13V43H12V45H11V47H10V50H11V51H12V52H29V51H31V50H32V49H33V48H34V47H35V46H36V44H37V42H38V40H39V39H40V37H41V35H42V34H43V32H45V34H46V35H47V37H48V39H49V41H50V42H51V44H52V46.7002H41V47H40V49H39V51H38V52H58V51H59V50H60V47H59V45H58V44H57V42H56V40H55V39H54V37H53V35H52V33H51V32H50V30H49V28H48V26H47V25H45V24H43V25H41V27H40V29H39V30H37V28H36V27H35V25H34V24H33V22H32V20H31V19H26V21ZM30 29H31V31H32V32H33V34H34V39H33V40H32V42H31V44H30V45H29V46H28V46.7002H17V45H18V44H19V42H20V40H21V39H22V37H23V35H24V34H25V32H26V30H27V28H28V27H30V29Z" fill="var(--icon-color)"/></svg>`,
    component: defineAsyncComponent(
      () => import('./index-jhtb02nG.mjs')
    ),
    ...ALLPROGRAMS.project
  },
  tproject: {
    label: "Просмотр проектов на тильде",
    icon: `<svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M66 2H68V4H70V66H68V68H66V70H4V68H2V66H0V4H2V2H4V0H66V2ZM59 40H58V43H57V46H56V48H55V49H54V51H53V52H52V53H51V54H49V55H48V56H46V57H43V58H40V59H30V58H27V57H24V58H26V59H30V60H40V59H44V58H46V57H48V56H49V55H51V54H52V53H53V52H54V51H55V49H56V48H57V46H58V43H59V40H60V30H59V40ZM22 57H24V56H22V57ZM21 56H22V55H21V56ZM19 55H21V54H19V55ZM18 54H19V53H18V54ZM17 53H18V52H17V53ZM16 52H17V51H16V52ZM15 51H16V49H15V51ZM33 50H36.5V33H36V32H35V31H33V50ZM14 49H15V48H14V49ZM13 48H14V46H13V48ZM12 46H13V43H12V46ZM11 43H12V40H11V43ZM30 11H27V12H24V13H22V14H21V15H19V16H18V17H17V18H16V19H15V21H14V22H13V24H12V27H11V29H10V40H11V30H12V27H13V24H14V22H15V21H16V19H17V18H18V17H19V16H21V15H22V14H24V13H27V12H30V11H40V12H43V11H40V10H30V11ZM25 25H24V26H23V28H22V31H24V30H25V29H26V28H27V27H30V28H33V29H36V30H38V31H43V30H45V28H46V24H44V25H43V27H42V28H38V27H36V26H34V25H32V24H25V25ZM58 30H59V26H58V30ZM57 26H58V24H57V26ZM56 24H57V22H56V24ZM55 22H56V21H55V22ZM54 21H55V19H54V21ZM53 19H54V18H53V19ZM52 18H53V17H52V18ZM51 17H52V16H51V17ZM49 16H51V15H49V16ZM48 15H49V14H48V15ZM46 14H48V13H46V14ZM43 13H46V12H43V13Z" fill="var(--icon-color)"/></svg>`,
    component: defineAsyncComponent(
      () => import('./index-jhtb02nG.mjs')
    ),
    ...ALLPROGRAMS.tproject
  }
};
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "name",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const icon = computed(() => {
      if (__props.windowOb.file === null) return "";
      const iconString = PROGRAMS[__props.windowOb.file.programType].icon;
      if (!iconString) return "";
      return iconString;
    });
    const label = computed(() => {
      if (!__props.windowOb.file) return "";
      const labelString = PROGRAMS[__props.windowOb.file.programType].label;
      if (!labelString) return;
      return labelString;
    });
    const name = computed(() => {
      if (!__props.windowOb.file) return "";
      const nameString = __props.windowOb.file.name;
      if (!nameString) return;
      return nameString;
    });
    const totalText = computed(() => {
      const total = [label.value, name.value].filter(Boolean);
      return total.join(" - ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.windowOb.file) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__name" }, _attrs))}><div class="window__name-icon">${unref(icon) ?? ""}</div><div class="window__name-text">${ssrInterpolate(unref(totalText))}</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$o = _sfc_main$o.setup;
_sfc_main$o.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/header/name.vue");
  return _sfc_setup$o ? _sfc_setup$o(props, ctx) : void 0;
};
const __nuxt_component_0$6 = Object.assign(_sfc_main$o, { __name: "WindowHeaderName" });
const viewport = ref({ width: 0, height: 0 });
const taskbarHeight = ref(0);
const contentArea = computed(() => ({
  width: viewport.value.width,
  height: viewport.value.height - taskbarHeight.value
}));
let setViewportObserverInitialised = false;
const setViewportObserver = () => {
  if (setViewportObserverInitialised) return;
  setViewportObserverInitialised = true;
};
let setTaskbarObserverInitialised = false;
const setTaskbarObserver = (elementRef) => {
  if (setTaskbarObserverInitialised) return;
  setTaskbarObserverInitialised = true;
};
const useContentArea = () => {
  return { contentArea, setTaskbarObserver, setViewportObserver };
};
function useSetChainedWatchers(getter, source, callback, options = void 0, mainCallback = () => {
}) {
  const cleaners = {};
  const clean = (key) => {
    if (cleaners[key] === void 0) return;
    cleaners[key]();
    delete cleaners[key];
  };
  const cleanAll = () => {
    for (const key in cleaners) {
      const typedKey = key;
      clean(typedKey);
    }
  };
  const create = (key, ...args) => {
    if (cleaners[key] !== void 0) return;
    cleaners[key] = watch(...args);
  };
  create(
    "main",
    getter,
    (v) => {
      mainCallback(v);
      if (v) {
        create("chained", source, callback, options);
      } else {
        clean("chained");
      }
    },
    { immediate: true }
  );
  return { cleanAll };
}
function useCollapsed(windowOb) {
  const { contentArea: contentArea2 } = useContentArea();
  useSetChainedWatchers(
    () => windowOb.states.collapsed === true,
    () => contentArea2,
    () => {
      windowOb.bounds.target.top = contentArea2.value.height * 1.5;
      windowOb.bounds.target.left = 0;
    },
    {
      immediate: true
    }
  );
  return () => {
    windowOb.states.collapsed = true;
    delete windowOb.states.fullscreen;
    delete windowOb.states.resize;
    delete windowOb.states.drag;
  };
}
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "collapse",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    useCollapsed(__props.windowOb);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__nav_el window__collapse" }, _attrs))}><div class="window__collapse_el"></div></div>`);
    };
  }
});
const _sfc_setup$n = _sfc_main$n.setup;
_sfc_main$n.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/header/nav/collapse.vue");
  return _sfc_setup$n ? _sfc_setup$n(props, ctx) : void 0;
};
const __nuxt_component_0$5 = Object.assign(_sfc_main$n, { __name: "WindowHeaderNavCollapse" });
const OFFSET = 15;
const MINSIZE = 320;
const clampHandlers = {
  // Ограничение top: [0, contentHeight - minHeight]
  top: (v, windowOb, _cw, ch) => Math.max(
    0,
    Math.min(v, ch - Math.min(windowOb.bounds.target.height, MINSIZE))
  ),
  // Ограничение left: [0, contentWidth - minWidth]
  left: (v, windowOb, cw, ch) => Math.max(
    0,
    Math.min(v, cw - Math.min(windowOb.bounds.target.width, MINSIZE))
  ),
  // Ограничение width: [MINSIZE, contentWidth]
  width: (v, windowOb, cw, ch) => Math.max(MINSIZE, Math.min(v, Math.min(v, cw))),
  // Ограничение height: [MINSIZE, contentHeight]
  height: (v, windowOb, cw, ch) => Math.max(MINSIZE, Math.min(v, ch))
};
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "fullscreen",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__nav_el window__fullscreen" }, _attrs))}><div class="window__fullscreen_el"></div><div class="window__fullscreen_el"></div></div>`);
    };
  }
});
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/header/nav/fullscreen.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const __nuxt_component_1$4 = Object.assign(_sfc_main$m, { __name: "WindowHeaderNavFullscreen" });
const STATE_KEY = "windows_all";
const COUNTER_KEY = "windows_all_counter";
const useAllWindows = () => {
  const allWindows = useState(STATE_KEY, () => ({}));
  const allWindowsIdCounter = useState(COUNTER_KEY, () => 0);
  return { allWindows, allWindowsIdCounter };
};
const clearAllWindowsState = () => {
  const allWindows = useState(STATE_KEY, () => ({}));
  const allWindowsIdCounter = useState(COUNTER_KEY, () => 0);
  allWindows.value = {};
  allWindowsIdCounter.value = 0;
};
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "close",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__nav_el window__close" }, _attrs))}><div class="window__close_el"></div><div class="window__close_el"></div></div>`);
    };
  }
});
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/header/nav/close.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const __nuxt_component_2$3 = Object.assign(_sfc_main$l, { __name: "WindowHeaderNavClose" });
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowHeaderNavCollapse = __nuxt_component_0$5;
      const _component_WindowHeaderNavFullscreen = __nuxt_component_1$4;
      const _component_WindowHeaderNavClose = __nuxt_component_2$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__nav__wrapper" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_WindowHeaderNavCollapse, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowHeaderNavFullscreen, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowHeaderNavClose, { windowOb: __props.windowOb }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/header/nav/index.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const __nuxt_component_1$3 = Object.assign(_sfc_main$k, { __name: "WindowHeaderNav" });
function useSetPath(path, router, route) {
  if (path === route.path) return;
  router.push(path);
}
const focusedWindowId = ref(null);
function useFocusWindowController() {
  const unFocus = () => {
    focusedWindowId.value = null;
  };
  const focus = (idWindow) => {
    focusedWindowId.value = idWindow;
  };
  const getIsFocusedState = (windowOb) => {
    return computed(() => windowOb.id === focusedWindowId.value);
  };
  const setDocumentEvent = () => {
    useRouter();
    const route = useRoute();
    watch(
      () => route.path,
      () => {
        if (route.path === "/") {
          focusedWindowId.value = null;
        }
      }
    );
  };
  return { setDocumentEvent, focus, unFocus, getIsFocusedState };
}
function useMove(windowOb) {
  const lastX = ref(0);
  const lastY = ref(0);
  const { contentArea: contentArea2 } = useContentArea();
  const { focus } = useFocusWindowController();
  const isOutOfBounds = () => {
    return lastX.value < OFFSET || lastY.value < OFFSET || lastX.value > contentArea2.value.width - OFFSET * 2 || lastY.value > contentArea2.value.height - OFFSET * 2;
  };
  const callback = () => {
    if (isOutOfBounds()) {
      windowOb.states["fullscreen-ready"] = true;
    } else {
      delete windowOb.states["fullscreen-ready"];
    }
  };
  watch(lastX, callback, {
    immediate: true
  });
  watch(lastY, callback, {
    immediate: true
  });
  return (ev) => {
    if (windowOb.states.fullscreen) return;
    focus(windowOb.id);
    windowOb.states.drag = true;
    lastY.value = ev.clientY;
    lastX.value = ev.clientX;
    const pointerMove = (ev2) => {
      const deltaY = ev2.clientY - lastY.value;
      const deltaX = ev2.clientX - lastX.value;
      lastY.value = ev2.clientY;
      lastX.value = ev2.clientX;
      windowOb.bounds.target.top += deltaY;
      windowOb.bounds.target.left += deltaX;
    };
    const pointerup = (ev2) => {
      lastY.value = ev2.clientY;
      lastX.value = ev2.clientX;
      delete windowOb.states.drag;
      (void 0).removeEventListener("pointermove", pointerMove);
      (void 0).removeEventListener("pointerup", pointerup);
      if (windowOb.states["fullscreen-ready"]) {
        windowOb.states.fullscreen = true;
      }
      delete windowOb.states["fullscreen-ready"];
    };
    (void 0).addEventListener("pointermove", pointerMove);
    (void 0).addEventListener("pointerup", pointerup);
  };
}
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    useMove(__props.windowOb);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowHeaderName = __nuxt_component_0$6;
      const _component_WindowHeaderNav = __nuxt_component_1$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__header" }, _attrs))}><div class="window__header__wrapper">`);
      _push(ssrRenderComponent(_component_WindowHeaderName, { windowOb: __props.windowOb }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_WindowHeaderNav, { windowOb: __props.windowOb }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/header/index.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const __nuxt_component_0$4 = Object.assign(_sfc_main$j, { __name: "WindowHeader" });
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "Content",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const component = shallowRef(null);
    const callback = () => {
      if (__props.windowOb.file === null) return null;
      const program = PROGRAMS[__props.windowOb.file.programType];
      if (!program) return null;
      const componentReal = program.component;
      if (componentReal === void 0) return null;
      return componentReal;
    };
    component.value = callback();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "window__content" }, _attrs))}>`);
      if (unref(component)) {
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(component)), { windowOb: __props.windowOb }, null), _parent);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/Content.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const __nuxt_component_1$2 = Object.assign(_sfc_main$i, { __name: "WindowContent" });
function syncBounds(windowOb) {
  for (const key in windowOb.boundsCalculated) {
    const typedKey = key;
    windowOb.boundsTarget[typedKey] = windowOb.boundsCalculated[typedKey];
  }
}
const chainedProperties = {
  top: {
    primary: "top",
    // Изменяем позицию top
    compensate: "height"
    // Компенсируем изменением высоты
  },
  left: {
    primary: "left",
    compensate: "width"
  },
  bottom: {
    primary: "height",
    // Просто изменяем высоту
    compensate: null
    // Нет компенсации
  },
  right: {
    primary: "width",
    compensate: null
  }
};
const calculate = {
  // Тянем верхний край вверх/вниз
  // Дельта = Курсор Y - Текущий Top окна
  top: (windowOb, x, y) => {
    return y - windowOb.bounds.target.top;
  },
  // Тянем левый край влево/вправо
  // Дельта = Курсор X - Текущий Left окна
  left: (windowOb, x, y) => {
    return x - windowOb.bounds.target.left;
  },
  // Тянем нижний край (изменяется высота)
  // Дельта = Курсор Y - Текущее дно (Top + Height)
  bottom: (windowOb, x, y) => {
    return y - (windowOb.bounds.target.top + windowOb.bounds.target.height);
  },
  // Тянем правый край (изменяется ширина)
  // Дельта = Курсор X - Текущий правый край (Left + Width)
  right: (windowOb, x, y) => {
    return x - (windowOb.bounds.target.left + windowOb.bounds.target.width);
  }
};
function useResizeForDirections(windowOb, properties) {
  const { contentArea: contentArea2 } = useContentArea();
  const result = {};
  for (const key of properties) {
    const { primary, compensate } = chainedProperties[key];
    result[key] = (x, y) => {
      const delta = calculate[key](windowOb, x, y);
      const bounds = windowOb.bounds.target;
      const clampPrimary = clampHandlers[primary];
      const clampedPrimary = clampPrimary(
        bounds[primary] + delta,
        windowOb,
        contentArea2.value.width,
        contentArea2.value.height
      );
      const clampedPrimaryDelta = clampedPrimary - bounds[primary];
      if (compensate) {
        const clampCompensate = clampHandlers[compensate];
        const clampedCompensate = clampCompensate(
          bounds[compensate] - delta,
          windowOb,
          contentArea2.value.width,
          contentArea2.value.height
        );
        const clampedCompensateDelta = clampedCompensate - bounds[compensate];
        if (clampedCompensateDelta === 0 || clampedPrimaryDelta === 0)
          return;
        bounds[compensate] = clampedCompensate;
      }
      bounds[primary] = clampedPrimary;
    };
  }
  return result;
}
function useResizeForDirectionsEvent(windowOb, directions) {
  const controlled = useResizeForDirections(windowOb, directions);
  const { focus } = useFocusWindowController();
  const onPointerDown = (ev) => {
    windowOb.states.resize = true;
    ev.preventDefault();
    syncBounds(windowOb);
    delete windowOb.states.fullscreen;
    delete windowOb.states.collapsed;
    ev.target.setPointerCapture(ev.pointerId);
    const onPointerMove = (ev2) => {
      if ("left" in controlled || "right" in controlled) {
        const key = "left" in controlled ? "left" : "right";
        controlled[key](ev2.clientX, ev2.clientY);
      }
      if ("top" in controlled || "bottom" in controlled) {
        const key = "top" in controlled ? "top" : "bottom";
        controlled[key](ev2.clientX, ev2.clientY);
      }
    };
    const onPointerUp = () => {
      focus(windowOb.id);
      delete windowOb.states.resize;
      (void 0).removeEventListener("pointermove", onPointerMove);
      (void 0).removeEventListener("pointerup", onPointerUp);
    };
    (void 0).addEventListener("pointermove", onPointerMove);
    (void 0).addEventListener("pointerup", onPointerUp);
  };
  return { onPointerDown };
}
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    directions: {},
    windowOb: {}
  },
  setup(__props) {
    useResizeForDirectionsEvent(__props.windowOb, __props.directions);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["window__resize__controlls", __props.directions]
      }, _attrs))}></div>`);
    };
  }
});
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/index.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const __nuxt_component_0$3 = Object.assign(_sfc_main$h, { __name: "WindowResize" });
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "Top",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["top"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/Top.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const __nuxt_component_0$2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$g, [["__scopeId", "data-v-779c8ae7"]]), { __name: "WindowResizeTop" });
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "Bottom",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["bottom"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/Bottom.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$f, [["__scopeId", "data-v-e3c23d4a"]]), { __name: "WindowResizeBottom" });
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "Left",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["left"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/Left.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const __nuxt_component_2$2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$e, [["__scopeId", "data-v-20ea489a"]]), { __name: "WindowResizeLeft" });
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "Right",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["right"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/Right.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const __nuxt_component_3$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$d, [["__scopeId", "data-v-0f366cc5"]]), { __name: "WindowResizeRight" });
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "LeftBottom",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["left", "bottom"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/LeftBottom.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$c, [["__scopeId", "data-v-8e441bc5"]]), { __name: "WindowResizeLeftBottom" });
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "RightBottom",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["right", "bottom"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/RightBottom.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$b, [["__scopeId", "data-v-9028f53c"]]), { __name: "WindowResizeRightBottom" });
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "LeftTop",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["left", "top"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/LeftTop.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$a, [["__scopeId", "data-v-2f57e473"]]), { __name: "WindowResizeLeftTop" });
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "RightTop",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    const directions = ["right", "top"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResize = __nuxt_component_0$3;
      _push(ssrRenderComponent(_component_WindowResize, mergeProps({
        directions,
        windowOb: __props.windowOb
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/RightTop.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$9, [["__scopeId", "data-v-bff0ec24"]]), { __name: "WindowResizeRightTop" });
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "All",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowResizeTop = __nuxt_component_0$2;
      const _component_WindowResizeBottom = __nuxt_component_1$1;
      const _component_WindowResizeLeft = __nuxt_component_2$2;
      const _component_WindowResizeRight = __nuxt_component_3$1;
      const _component_WindowResizeLeftBottom = __nuxt_component_4;
      const _component_WindowResizeRightBottom = __nuxt_component_5;
      const _component_WindowResizeLeftTop = __nuxt_component_6;
      const _component_WindowResizeRightTop = __nuxt_component_7;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_WindowResizeTop, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeBottom, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeLeft, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeRight, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeLeftBottom, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeRightBottom, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeLeftTop, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowResizeRightTop, { windowOb: __props.windowOb }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/resize/All.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_2$1 = Object.assign(_sfc_main$8, { __name: "WindowResizeAll" });
const useFocusOnClick = (windowOb) => {
  const { focus } = useFocusWindowController();
  const focusWindow = () => {
    focus(windowOb.id);
  };
  return { focusWindow };
};
function useSetFocusState(windowOb) {
  const { getIsFocusedState } = useFocusWindowController();
  const isFocused = getIsFocusedState(windowOb);
  watch(
    isFocused,
    () => {
      if (isFocused.value) {
        windowOb.states.focused = true;
      } else {
        delete windowOb.states.focused;
      }
    },
    {
      immediate: true
    }
  );
  watch(
    () => windowOb.states.fullscreen,
    (st) => {
      setTimeout(() => {
        if (st) {
          windowOb.states.focused = true;
        }
      });
    },
    {
      immediate: true
    }
  );
}
function useOnFullscreen(windowOb, isForce = false) {
  const { contentArea: contentArea2 } = useContentArea();
  const set = (prop, value) => {
    windowOb.bounds.target[prop] = value;
    if (isForce) {
      windowOb.bounds.calculated[prop] = value;
    }
  };
  set("left", 0);
  set("top", 0);
  set("width", contentArea2.value.width);
  set("height", contentArea2.value.height);
}
function useSetFullscreenObserver(windowOb) {
  const { contentArea: contentArea2 } = useContentArea();
  useSetChainedWatchers(
    () => windowOb.states.fullscreen === true,
    contentArea2,
    () => {
      useOnFullscreen(windowOb, true);
    },
    {
      immediate: true
    }
  );
}
function useWindowFullscreenAutoSet(windowOb) {
  const { contentArea: contentArea2 } = useContentArea();
  const isOutOfBounds = () => {
    const bounds = windowOb.bounds.target;
    return bounds.left < OFFSET || bounds.top < OFFSET || bounds.left + bounds.width > contentArea2.value.width - OFFSET || bounds.top + bounds.height > contentArea2.value.height - OFFSET;
  };
  useSetChainedWatchers(
    () => windowOb.states.drag === true,
    () => windowOb.bounds.target,
    () => {
      if (isOutOfBounds()) {
        windowOb.states["fullscreen-ready"] = true;
      } else {
        delete windowOb.states["fullscreen-ready"];
      }
    }
  );
  watch(
    () => windowOb.states.drag === true,
    (v) => {
      if (!v)
        setTimeout(() => {
          if (windowOb.states["fullscreen-ready"])
            windowOb.states["fullscreen"] = true;
          delete windowOb.states["fullscreen-ready"];
        }, 10);
    },
    {
      immediate: true
    }
  );
}
const loaders = reactive({});
function useWindowLoading() {
  const register = (windowId, isLoading2) => {
    if (!loaders[windowId]) {
      loaders[windowId] = [];
    }
    loaders[windowId].push(isLoading2);
  };
  const getIsLoading = (windowId) => computed(
    () => loaders[windowId]?.some((ref2) => ref2 ? ref2.value : false) ?? false
  );
  const { allWindows } = useAllWindows();
  const initWindowLoading = (windowId) => {
    watch(
      () => loaders[windowId],
      () => {
        const windowOb = allWindows.value[windowId];
        if (!windowOb) return;
        if (isLoading(windowId)) {
          windowOb.states.loading = true;
        } else {
          delete windowOb.states.loading;
        }
      },
      {
        immediate: true,
        deep: true
      }
    );
  };
  return {
    initWindowLoading,
    register,
    getIsLoading
  };
}
class Preprocessor {
  controller;
  // Коэффициент сглаживания (reactive, зависит от состояния окна)
  inerpolatedCoeff;
  constructor(controller) {
    this.controller = controller;
    this.inerpolatedCoeff = computed(() => {
      if (this.controller.windowOb.states.drag || this.controller.windowOb.states.resize) {
        return 0.6;
      }
      return 0.9;
    });
  }
  /**
   * Вычисляет новое значение calculated[key] с применением easing.
   * @param key - Свойство для анимации (left/top/width/height)
   * @param deltaTime - Время с последнего кадра (мс)
   */
  calculate(key, deltaTime) {
    const delta = this.controller.windowOb.bounds.target[key] - this.controller.windowOb.bounds.calculated[key];
    const totalDelta = this.getEaysied(delta, deltaTime);
    this.controller.windowOb.bounds.calculated[key] += totalDelta;
  }
  /**
   * Формула easing для плавного приближения к цели.
   * factor = 1 - coeff^(deltaTime/16)
   *
   * Деление на 16 нормализует коэффициент под 60 FPS (16ms ≈ 1 кадр).
   * При deltaTime=16 и coeff=0.9: factor ≈ 0.1 (10% от дельты за кадр)
   */
  getEaysied(delta, deltaTime) {
    const factor = 1 - Math.pow(this.inerpolatedCoeff.value, deltaTime / 16);
    return delta * factor;
  }
}
class WindowLoopController {
  windowOb;
  loops = {};
  preprocessor;
  // 4 свойства для анимации
  keys = ["left", "top", "height", "width"];
  mainWatcher = null;
  constructor(windowOb) {
    this.windowOb = windowOb;
    this.preprocessor = new Preprocessor(this);
  }
  start() {
    this.createLoops();
  }
  // Создаёт 4 цикла анимации для каждого свойства границ
  createLoops() {
    for (const key of this.keys) {
      const typedKey = key;
      this.createLoop(typedKey);
    }
  }
  // Удаляет все циклы и очищает ресурсы
  destroyLoops() {
    for (const key of this.keys) {
      const typedKey = key;
      this.destroyLoop(typedKey);
    }
  }
  /**
   * Создаёт watcher для отслеживания изменения bounds.target[key].
   * При изменении запускает анимацию через RAF.
   */
  createLoop(key) {
    if (this.loops[key] !== void 0) return;
    this.loops[key] = {
      clearWatcher: null,
      rafId: null,
      lastTimestamp: performance.now()
    };
    this.loops[key].clearWatcher = watch(
      () => this.windowOb.bounds.target[key],
      () => {
        this.startAnimation(key);
      },
      {
        immediate: true
      }
    );
  }
  // Останавливает анимацию и удаляет watcher для свойства
  destroyLoop(key) {
    this.stopAnimation(key);
    this.clearWatcher(key);
    delete this.loops[key];
  }
  /**
   * Запускает анимационный цикл для свойства.
   * Использует RAF для плавности, рассчитывает deltaTime для независимости от FPS.
   */
  startAnimation = (key) => {
    if (this.loops[key]?.rafId !== null) return;
    this.loops[key].lastTimestamp = performance.now();
    const animation = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.loops[key].lastTimestamp;
      this.loops[key].lastTimestamp = currentTime;
      this.preprocessor.calculate(key, deltaTime);
      if (Math.abs(
        this.windowOb.bounds.calculated[key] - this.windowOb.bounds.target[key]
      ) < 0.1) {
        this.windowOb.bounds.calculated[key] = this.windowOb.bounds.target[key];
        this.stopAnimation(key);
        return;
      }
      this.loops[key].rafId = requestAnimationFrame(animation);
    };
    this.loops[key].rafId = requestAnimationFrame(animation);
  };
  // Останавливает RAF для свойства
  stopAnimation = (key) => {
    if (!this.loops[key]?.rafId) return;
    cancelAnimationFrame(this.loops[key].rafId);
    this.loops[key].rafId = null;
  };
  // Очищает watcher свойства
  clearWatcher(key) {
    if (!this.loops[key]?.clearWatcher) return;
    this.loops[key]?.clearWatcher();
  }
  // Полная очистка контроллера
  destroy() {
    this.destroyLoops();
    if (!this.mainWatcher) return;
    this.mainWatcher();
  }
}
function useWindowLoop(windowOb) {
  new WindowLoopController(windowOb);
}
async function useWindowRoutesController(windowOb) {
  const router = useRouter();
  const route = useRoute();
  const { focus } = useFocusWindowController();
  const { register } = useWindowLoading();
  watch(
    () => route.path,
    () => {
      if (route.path === windowOb.targetFile) {
        useSetPath(route.path, router, route);
        focus(windowOb.id);
        return;
      }
    }
  );
  useSetChainedWatchers(
    () => windowOb.states.focused === true,
    () => route.path,
    () => {
      if (route.path === "/") {
        return;
      }
      if (route.path.startsWith(windowOb.targetFile) || windowOb.targetFile.startsWith(route.path)) {
        windowOb.targetFile = route.path;
        useSetPath(route.path, router, route);
      }
    },
    {
      immediate: true
    }
  );
  watch(
    () => windowOb.states.focused === true,
    (v) => {
      if (v) {
        useSetPath(windowOb.targetFile, router, route);
      }
    },
    {
      immediate: true
    }
  );
  const { data, pending, refresh } = await useAsyncData(
    () => `window-entity-${windowOb.targetFile}`,
    async () => {
      const entity = await $fetch("/api/filesystem/get", {
        responseType: "json",
        method: "POST",
        body: {
          path: windowOb.targetFile
        }
      });
      return entity;
    },
    {
      lazy: false
    }
  );
  if (data.value) {
    windowOb.file = { path: windowOb.targetFile, ...data.value };
  }
  watch(
    () => windowOb.targetFile,
    async () => {
      if (windowOb.states.focused) {
        useSetPath(windowOb.targetFile, router, route);
      }
      if (windowOb.file === null || windowOb.targetFile !== windowOb.file.path) {
        await refresh();
      }
    }
  );
  register(windowOb.id, pending);
  watch(data, () => {
    if (!data.value) {
      windowOb.file = null;
      return;
    }
    windowOb.file = { path: windowOb.targetFile, ...data.value };
  });
}
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  async setup(__props) {
    let __temp, __restore;
    useWindowLoop(__props.windowOb);
    useSetFullscreenObserver(__props.windowOb);
    useWindowFullscreenAutoSet(__props.windowOb);
    useSetFocusState(__props.windowOb);
    const width = computed(() => __props.windowOb.bounds.calculated.width);
    const height = computed(() => __props.windowOb.bounds.calculated.height);
    const left = computed(() => __props.windowOb.bounds.calculated.left);
    const top = computed(() => __props.windowOb.bounds.calculated.top);
    useFocusOnClick(__props.windowOb);
    const { getIsLoading } = useWindowLoading();
    const isLoading2 = getIsLoading(__props.windowOb.id);
    watch(
      isLoading2,
      () => {
        if (isLoading2.value) {
          __props.windowOb.states.loading = true;
        } else {
          delete __props.windowOb.states.loading;
        }
      },
      {
        immediate: true
      }
    );
    [__temp, __restore] = withAsyncContext(() => useWindowRoutesController(__props.windowOb)), await __temp, __restore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WindowHeader = __nuxt_component_0$4;
      const _component_WindowContent = __nuxt_component_1$2;
      const _component_WindowResizeAll = __nuxt_component_2$1;
      const _cssVars = { style: {
        ":--v9d159ea6": unref(width),
        ":--v6361eb20": unref(height),
        ":--v36a7b780": unref(left),
        ":--v22cb5c08": unref(top)
      } };
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["window", __props.windowOb.states],
        id: `window-${__props.windowOb.id}`
      }, _attrs, _cssVars))}><div class="window__wrapper">`);
      _push(ssrRenderComponent(_component_WindowHeader, { windowOb: __props.windowOb }, null, _parent));
      _push(ssrRenderComponent(_component_WindowContent, { windowOb: __props.windowOb }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_WindowResizeAll, { windowOb: __props.windowOb }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/index.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_0$1 = Object.assign(_sfc_main$7, { __name: "Window" });
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "View",
  __ssrInlineRender: true,
  setup(__props) {
    const { allWindows } = useAllWindows();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Window = __nuxt_component_0$1;
      _push(`<!--[-->`);
      ssrRenderList(unref(allWindows), (windowOb) => {
        _push(ssrRenderComponent(_component_Window, {
          windowOb,
          key: windowOb.id
        }, null, _parent));
      });
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Window/View.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$6, { __name: "WindowView" });
function useGetShortcut(fsFile) {
  const isRegisteredFile = Object.hasOwn(PROGRAMS, fsFile.programType);
  const icon = !isRegisteredFile ? null : PROGRAMS[fsFile.programType]?.icon;
  const extention = !isRegisteredFile ? null : PROGRAMS[fsFile.programType]?.extension;
  let nameText = fsFile.name;
  if (extention) {
    nameText += `.${extention}`;
  }
  return {
    isRegisteredFile,
    icon,
    extention,
    nameText
  };
}
function useGetId() {
  const { allWindowsIdCounter } = useAllWindows();
  return (++allWindowsIdCounter.value).toString();
}
const useWindowPaths = () => {
  const { allWindows } = useAllWindows();
  const hasPath = (path) => {
    for (const key in allWindows.value) {
      const typedKey = key;
      if (allWindows.value[typedKey].targetFile === path)
        return allWindows.value[typedKey].id;
    }
    return false;
  };
  return {
    hasPath
  };
};
function useCreateAndRegisterWindow(file, options = {
  isForce: false
}) {
  const { allWindows } = useAllWindows();
  const { hasPath } = useWindowPaths();
  const { focus } = useFocusWindowController();
  const path = typeof file === "string" ? file : file.path;
  if (!options.isForce) {
    const idWindow = hasPath(path);
    if (idWindow !== false) {
      focus(idWindow);
      return null;
    }
  }
  const id = useGetId();
  const calculated = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  };
  const target = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  };
  const states = {};
  const realFile = typeof file === "string" ? null : file;
  const windowOb = {
    id,
    bounds: {
      target,
      calculated
    },
    states,
    targetFile: path,
    file: realFile
  };
  allWindows.value[id] = windowOb;
  focus(windowOb.id);
  return windowOb;
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    file: {}
  },
  setup(__props) {
    const { isRegisteredFile, icon, nameText } = useGetShortcut(__props.file);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isRegisteredFile)) {
        _push(`<a${ssrRenderAttrs(mergeProps({
          href: __props.file.path,
          class: "shortcut"
        }, _attrs))}><div class="shortcut_img">${unref(icon) ?? ""}</div><div class="shortcut_text">${ssrInterpolate(unref(nameText))}</div></a>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Workbench/Shortcut/index.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$5, { __name: "WorkbenchShortcut" });
function useGridCells(element, preferredCell) {
  const elementBounds = ref({
    width: 0,
    height: 0
  });
  const cellsInElement = reactive({
    x: 0,
    y: 0
  });
  const realCell = computed(() => {
    if (cellsInElement.x === 0 || cellsInElement.y === 0) {
      return {
        width: preferredCell.width,
        height: preferredCell.height
      };
    }
    return {
      width: elementBounds.value.width / cellsInElement.x,
      height: elementBounds.value.height / cellsInElement.y
    };
  });
  const calculateCells = () => {
    if (!element.value) return;
    const bounds = element.value.getBoundingClientRect();
    elementBounds.value.width = bounds.width;
    elementBounds.value.height = bounds.height;
    cellsInElement.x = Math.ceil(
      elementBounds.value.width / preferredCell.width
    );
    cellsInElement.y = Math.ceil(
      elementBounds.value.height / preferredCell.height
    );
  };
  const subscribe = () => {
    if (!element.value) {
      console.error("useGridCells: Элемент не найден");
      return;
    }
    calculateCells();
    const resizeObserver = new ResizeObserver(calculateCells);
    resizeObserver.observe(element.value);
  };
  return {
    subscribe,
    realCell,
    cellsInElement,
    elementBounds
  };
}
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const workbench = ref(null);
    const { contentArea: contentArea2 } = useContentArea();
    const { cellsInElement, realCell } = useGridCells(workbench, {
      width: 100,
      height: 120
    });
    const width = computed(() => contentArea2.value.width);
    const height = computed(() => contentArea2.value.height);
    const columns = computed(() => {
      const count = cellsInElement.x;
      const size = realCell.value.width;
      return `repeat(${count}, ${size}px)`;
    });
    const rows = computed(() => {
      const count = cellsInElement.y;
      const size = realCell.value.height;
      return `repeat(${count}, ${size}px)`;
    });
    const { data } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "workbench",
      () => {
        const data2 = $fetch("/api/filesystem/list", {
          body: {
            path: "/"
          },
          method: "POST"
        });
        return data2;
      },
      {}
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WorkbenchShortcut = __nuxt_component_0;
      const _cssVars = { style: {
        ":--v5a8b2b2e": unref(width),
        ":--v45e97e82": unref(height),
        ":--v65c24976": unref(columns),
        ":--v4cc1911e": unref(rows)
      } };
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "workbench",
        ref: workbench,
        class: "workbench"
      }, _attrs, _cssVars))}><!--[-->`);
      ssrRenderList(unref(data), (file) => {
        _push(ssrRenderComponent(_component_WorkbenchShortcut, {
          key: file.path,
          file
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Workbench/index.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$4, { __name: "Workbench" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const taskbar = ref(null);
    const { setTaskbarObserver: setTaskbarObserver2 } = useContentArea();
    setTaskbarObserver2(taskbar);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "taskbar",
        ref: taskbar,
        class: "taskbar"
      }, _attrs))}></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Taskbar/index.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$3, { __name: "Taskbar" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const { setViewportObserver: setViewportObserver2 } = useContentArea();
    setViewportObserver2();
    const route = useRoute();
    clearAllWindowsState();
    if (route.fullPath !== "/") {
      useCreateAndRegisterWindow(route.fullPath);
    }
    const { setDocumentEvent } = useFocusWindowController();
    setDocumentEvent();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0$7;
      const _component_WindowView = __nuxt_component_1;
      const _component_Workbench = __nuxt_component_2;
      const _component_Taskbar = __nuxt_component_3;
      _push(ssrRenderComponent(_component_NuxtLayout, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_WindowView, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Workbench, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Taskbar, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_WindowView),
              createVNode(_component_Workbench),
              createVNode(_component_Taskbar)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-D4V_XpAS.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-OtIPWaa7.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { _export_sfc as _, useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, useRoute as d, entry_default as default, encodeRoutePath as e, clearAllWindowsState as f, useCreateAndRegisterWindow as g, __nuxt_component_0$7 as h, __nuxt_component_1 as i, __nuxt_component_2 as j, __nuxt_component_3 as k, useContentArea as l, useFocusWindowController as m, navigateTo as n, useGridCells as o, useGetShortcut as p, useAsyncData as q, resolveRouteObject as r, useWindowLoading as s, useRouter as u };
//# sourceMappingURL=server.mjs.map
