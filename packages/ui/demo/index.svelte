<script lang="ts">
  export let stories: string[];
  let current = globalThis.location?.hash.slice(1) || stories[0];
  let preview: HTMLIFrameElement | undefined;

  const capitalize = (x: string) => x.replace(/\b\w/g, (c) => c.toUpperCase());

  $: if (preview) preview.src = `stories/${current}`;
  $: if ("location" in globalThis) location.hash = current;
</script>

<main class="min-w-screen flex">
  <ul class="flex min-h-screen min-w-max flex-col gap-2 p-8 shadow-lg">
    {#each stories as story}
      <li
        id={story}
        class="text-center text-slate-600 underline-offset-4 target:underline hover:text-slate-900"
      >
        <a href="#{story}" on:click={() => (current = story)}>
          {capitalize(story)}
        </a>
      </li>
    {/each}
  </ul>

  <iframe
    class="m-10 w-full resize rounded-md border-2 border-solid border-slate-200"
    title="Story"
    bind:this={preview}
  />
</main>
