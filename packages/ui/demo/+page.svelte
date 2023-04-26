<script lang="ts">
  import { LightSwitch, Stack, Nav, Button, Icon } from "@amadeus-music/ui";
  import { capitalize } from "@amadeus-music/util/string";
  import { flipped } from "@amadeus-music/ui";
  import type { PageData } from "./$types";
  import { hash } from "../internal/page";
  import { onMount } from "svelte";

  export let data: PageData;

  let innerSwitch: HTMLInputElement | undefined;
  let preview: HTMLIFrameElement | undefined;

  $: current = $hash || data.stories[0];
  $: if (preview) preview.src = `/${current}`;
  $: if (innerSwitch) innerSwitch.checked = $flipped;

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

<Stack x grow>
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
  <iframe
    title="Story"
    class="m-8 w-full resize rounded-md p-4 outline outline-1 outline-highlight-100"
    bind:this={preview}
  />
</Stack>
