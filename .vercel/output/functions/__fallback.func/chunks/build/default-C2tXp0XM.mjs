import { defineComponent, ref, watchEffect, mergeProps, computed, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot, ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc, o as useGridCells, l as useContentArea } from './server.mjs';
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

const lineWidth = 1;
const lineColor = `rgba(21, 21, 21, 0.1)`;
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Background",
  __ssrInlineRender: true,
  setup(__props) {
    const canvas = ref(null);
    const element = ref(null);
    const { realCell, cellsInElement, elementBounds } = useGridCells(
      element,
      {
        width: 50,
        // Базовый размер ячейки
        height: 50
      }
    );
    const draw = () => {
      if (!canvas.value) return;
      const ctx = canvas.value.getContext("2d");
      if (!ctx) return;
      const dpr = (void 0).devicePixelRatio || 1;
      const width = elementBounds.value.width * dpr;
      const height = elementBounds.value.height * dpr;
      canvas.value.width = width;
      canvas.value.height = height;
      canvas.value.style.width = elementBounds.value.width + "px";
      canvas.value.style.height = elementBounds.value.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      for (let i = 1; i < cellsInElement.x; i++) {
        const x = realCell.value.width * i;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, elementBounds.value.height);
      }
      for (let i = 1; i < cellsInElement.y; i++) {
        const y = realCell.value.height * i;
        ctx.moveTo(0, y);
        ctx.lineTo(elementBounds.value.width, y);
      }
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };
    watchEffect(draw);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "background",
        ref_key: "element",
        ref: element
      }, _attrs))}><canvas class="background__canvas"></canvas></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Background.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "Background" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FullscreenPreffered",
  __ssrInlineRender: true,
  setup(__props) {
    const { contentArea } = useContentArea();
    const width = computed(() => contentArea.value.width);
    const height = computed(() => contentArea.value.height);
    return (_ctx, _push, _parent, _attrs) => {
      const _cssVars = { style: {
        ":--c63f993a": unref(width),
        ":--v355181ac": unref(height)
      } };
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "fullscreen_preffered" }, _attrs, _cssVars))}></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FullscreenPreffered.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "FullscreenPreffered" });
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_Background = __nuxt_component_0;
  const _component_FullscreenPreffered = __nuxt_component_1;
  _push(`<!--[-->`);
  _push(ssrRenderComponent(_component_Background, null, null, _parent));
  _push(ssrRenderComponent(_component_FullscreenPreffered, null, null, _parent));
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-C2tXp0XM.mjs.map
