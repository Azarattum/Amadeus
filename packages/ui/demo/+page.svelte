<script lang="ts">
  import LightSwitch from "$lib/elements/LightSwitch.svelte";
  import { capitalize } from "@amadeus-music/util/string";
  import type { PageData } from "./$types";

  export let data: PageData;

  let current = globalThis.location?.hash.slice(1) || data.stories[0];
  let preview: HTMLIFrameElement | undefined;

  $: if (preview) preview.src = `/${current}`;
  $: if ("location" in globalThis) location.hash = current;
</script>

<main class="min-w-screen surface-400 flex">
  <nav class="surface-500 flex min-h-screen flex-col justify-between p-4">
    <ul class="flex flex-col gap-2">
      {#each data.stories as story}
        <li
          id={story}
          class="text-center text-content-200 underline-offset-4 target:text-primary-600 target:underline hover:text-content-100"
        >
          <a href="#{story}" on:click={() => (current = story)}>
            {capitalize(story)}
          </a>
        </li>
      {/each}
    </ul>
    <div class="h-8 w-8 bg-yellow-400 dark:bg-blue-400" />

    <LightSwitch />
  </nav>

  <iframe
    class="m-10 w-full resize rounded-md border-2 border-solid border-content-400"
    title="Story"
    bind:this={preview}
  />
</main>
