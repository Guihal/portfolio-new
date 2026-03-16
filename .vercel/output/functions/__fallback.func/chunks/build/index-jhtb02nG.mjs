import { defineComponent, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { q as useAsyncData, s as useWindowLoading, p as useGetShortcut } from './server.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "shortcut",
  __ssrInlineRender: true,
  props: {
    windowOb: {},
    file: {}
  },
  setup(__props) {
    const { nameText, icon } = useGetShortcut(__props.file);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<a${ssrRenderAttrs(mergeProps({
        href: __props.file.path,
        class: "explorer__shortcut"
      }, _attrs))}>`);
      if (unref(icon)) {
        _push(`<div class="explorer__shortcut-icon">${unref(icon) ?? ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="explorer__shortcut-text">${ssrInterpolate(unref(nameText))}</div></a>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Programs/Explorer/shortcut.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "ProgramsExplorerShortcut" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    windowOb: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      () => `explorer-list-${__props.windowOb.targetFile}`,
      () => {
        return $fetch("/api/filesystem/list", {
          body: {
            path: __props.windowOb.targetFile
          },
          method: "POST"
        });
      },
      {
        watch: [() => __props.windowOb.targetFile]
      }
    )), __temp = await __temp, __restore(), __temp);
    const { register } = useWindowLoading();
    register(__props.windowOb.id, pending);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProgramsExplorerShortcut = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "explorer" }, _attrs))}>`);
      if (unref(data)?.length) {
        _push(`<!--[-->`);
        ssrRenderList(unref(data), (file) => {
          _push(ssrRenderComponent(_component_ProgramsExplorerShortcut, {
            key: file.path,
            file,
            windowOb: __props.windowOb
          }, null, _parent));
        });
        _push(`<!--]-->`);
      } else {
        _push(`<div class="explorer__empty">Тут ничего нет :(</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Programs/Explorer/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = Object.assign(_sfc_main, { __name: "ProgramsExplorer" });

export { index as default };
//# sourceMappingURL=index-jhtb02nG.mjs.map
