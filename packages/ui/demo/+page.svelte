<script lang="ts">
  import { capitalize } from "@amadeus-music/util/string";
  import type { PageData } from "./$types";

  export let data: PageData;

  let current = globalThis.location?.hash.slice(1) || data.stories[0];
  let preview: HTMLIFrameElement | undefined;

  $: if (preview) preview.src = `/${current}`;
  $: if ("location" in globalThis) location.hash = current;
</script>

<main class="min-w-screen surface-400 flex">
  <ul class="surface-500 flex min-h-screen flex-col gap-2 p-8">
    {#each data.stories as story}
      <li
        id={story}
        class="text-content-200 hover:text-content-100 text-center underline-offset-4 target:text-primary-600 target:underline"
      >
        <a href="#{story}" on:click={() => (current = story)}>
          {capitalize(story)}
        </a>
      </li>
    {/each}
  </ul>

  <iframe
    class="border-content-400 m-10 w-full resize rounded-md border-2 border-solid"
    title="Story"
    bind:this={preview}
  />
</main>
