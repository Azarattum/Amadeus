<script lang="ts">
  import { onMount } from "svelte";

  export let target: HTMLElement | null | undefined = globalThis.document?.body;
  let portal: HTMLElement;

  onMount(() => {
    if (target) target.appendChild(portal);
  });
</script>

<div class="contents" bind:this={portal}>
  <slot />
</div>
