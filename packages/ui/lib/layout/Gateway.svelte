<script lang="ts">
  import { setContext } from "svelte";

  const target = eval("slots");
  const context: any = { before: [], after: [], mount: null, mounts: {} };
  setContext("gateway", context);

  if (import.meta.env.SSR) {
    const slot = target.default ? target.default({}) : "";
    target.default = () =>
      context.before.join("") + slot + context.after.join("");
  } else {
    const [original] = target.default;
    target.default[0] = (..._: any) => {
      const instance = original(..._);
      return {
        ...instance,
        m(target: any, anchor: any) {
          context.mount = target;
          instance.m(target, anchor);
        },
      };
    };
  }
</script>

<slot />
