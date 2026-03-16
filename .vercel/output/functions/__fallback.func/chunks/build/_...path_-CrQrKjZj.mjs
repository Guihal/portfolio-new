import { l as useContentArea, d as useRoute, f as clearAllWindowsState, g as useCreateAndRegisterWindow, m as useFocusWindowController, h as __nuxt_component_0$7, i as __nuxt_component_1, j as __nuxt_component_2, k as __nuxt_component_3 } from './server.mjs';
import { defineComponent, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
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
import 'pinia';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[...path]",
  __ssrInlineRender: true,
  setup(__props) {
    const { setViewportObserver } = useContentArea();
    setViewportObserver();
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
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...path].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_...path_-CrQrKjZj.mjs.map
