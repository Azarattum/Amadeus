<script lang="ts">
  import { onMount } from "svelte";

  export let target: HTMLElement | null | undefined = globalThis.document?.body;
  export let prepend = false;
  let portal: HTMLElement;

  onMount(() => {
    if (!prepend) portal.childNodes.forEach((x) => target?.appendChild(x));
    else portal.childNodes.forEach((x) => target?.prepend(x));
    portal.remove();
  });
</script>

<div class="hidden" bind:this={portal}>
  <slot />
</div>
