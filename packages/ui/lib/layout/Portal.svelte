<script lang="ts">
  import { getContext, tick } from "svelte";

  export let unique = "";
  export let before = false;
  const target = eval("slots");
  const context = getContext<any>("gateway");

  if (import.meta.env.SSR) {
    const slot = target.default ? target.default({}) : "";
    if (!context.mounts[unique]) {
      if (unique) context.mounts[unique] = true;
      if (before) context.before.push(slot);
      else context.after.push(slot);
    }
    target.default = undefined;
  } else {
    let mounted = false;
    const [original] = target.default;
    target.default[0] = (..._: any) => {
      const instance = original(..._);
      return {
        ...instance,
        async m(target: any, anchor: any) {
          if (context.mounts[unique]) return;
          if (unique) (context.mounts[unique] = true), (mounted = true);
          await tick();
          if (!context.mount) return instance.m(target, anchor);
          if (!before) return instance.m(context.mount, null);
          instance.m(context.mount, context.mount.firstChild);
        },
        d(detaching: any) {
          if (unique && mounted) context.mounts[unique] = false;
          instance.d(detaching);
        },
      };
    };
  }
</script>

{#key before}
  <slot />
{/key}
