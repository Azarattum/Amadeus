<script lang="ts">
  import { LightSwitch, Nav, Button, Icon } from "@amadeus-music/ui";
  import { capitalize } from "@amadeus-music/util/string";
  import { flipped } from "@amadeus-music/ui";
  import type { PageData } from "./$types";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  export let data: PageData;

  let innerSwitch: HTMLInputElement | undefined;
  let preview: HTMLIFrameElement | undefined;

  $: if (preview) preview.src = `/${current}`;
  $: if (innerSwitch) innerSwitch.checked = $flipped;
  $: current =
    $page.url.hash.slice(1) ||
    (globalThis.location?.replace("#" + data.stories[0]), data.stories[0]);

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

<Nav section="Stories">
  <svelte:fragment slot="section">
    {#each data.stories as story}
      <Button href="#{story}" air>
        <Icon name="book" />{capitalize(story)}
        <span id={story} />
      </Button>
    {/each}
  </svelte:fragment>
  <LightSwitch slot="bottom-section" />
</Nav>
<div class="h-full w-full p-8">
  <iframe
    title="Story"
    class="h-full w-full grow resize rounded-md p-4 outline outline-1 outline-highlight-100"
    bind:this={preview}
  />
</div>
