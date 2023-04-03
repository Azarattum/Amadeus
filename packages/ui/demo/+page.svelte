<script lang="ts">
  import { LightSwitch, HStack, Nav, Button } from "@amadeus-music/ui";
  import { capitalize } from "@amadeus-music/util/string";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  export let data: PageData;

  let current = globalThis.location?.hash.slice(1) || data.stories[0];
  let preview: HTMLIFrameElement | undefined;
  let innerSwitch: HTMLInputElement | undefined;
  let flipped = false;

  $: if (preview) preview.src = `/${current}`;
  $: if ("location" in globalThis) location.hash = current;

  $: if (innerSwitch) innerSwitch.checked = flipped;
  onMount(() => {
    preview?.addEventListener(
      "load",
      () =>
        (innerSwitch = preview?.contentDocument?.getElementById(
          "light-switch"
        ) as any)
    );
  });
</script>

<HStack>
  <Nav section="Stories">
    {#each data.stories as story}
      <Button href="#{story}" air on:click={() => (current = story)}>
        {capitalize(story)}
      </Button>
    {/each}
    <LightSwitch bind:flipped slot="bottom" />
  </Nav>
  <iframe
    title="Story"
    class="outline-highlight-100 m-8 w-full resize rounded-md p-4 outline outline-1"
    bind:this={preview}
  />
</HStack>
