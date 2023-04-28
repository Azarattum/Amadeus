<script lang="ts">
  import { intersection, type IntersectionEvent } from "../../action";
  import { getContext, onMount } from "svelte";
  import { flipped } from "../../component";
  import { goto } from "$app/navigation";

  export let name: string;
  const tabs = getContext<string[]>("tabs");
  tabs.push(name);

  let section: HTMLElement;
  let current = false;
  let stuck = false;

  const scrollUp = () => section.scrollTo({ top: 0, behavior: "smooth" });

  function scrolled({ detail }: IntersectionEvent) {
    if (
      Math.round(detail.boundingClientRect.x) !==
      Math.round(section.parentElement?.getBoundingClientRect().x || 0)
    ) {
      return;
    }
    stuck = detail.intersectionRatio < 0.8;
  }

  function changed({ detail }: IntersectionEvent) {
    current = detail.intersectionRatio > 0.5;
    if (detail.intersectionRatio >= 0.999 && tabs.length > 1) {
      location.replace(`#${name.toLowerCase()}`);
    }
  }

  onMount(() => {
    if (location.hash === `#${name.toLowerCase()}`) section.scrollIntoView();
  });
</script>

<section
  use:intersection={[0, 0.5, 0.999]}
  on:intersect={changed}
  bind:this={section}
  id={name.toLowerCase()}
  class="z-10 h-full w-full snap-start snap-always overflow-x-hidden overflow-y-scroll"
  class:[&~nav_div_a]:pointer-events-none={current && stuck}
  class:[&~nav_div_a]:-translate-y-full={current && stuck}
  class:[&~nav_div]:opacity-0={current && stuck}
  class:target={current}
>
  <div
    class="pointer-events-none h-0 p-11"
    on:intersect={scrolled}
    use:intersection={0.8}
  />
  <h2>
    <button
      tabindex="-1"
      on:click={scrollUp}
      class="fixed top-0 z-50 mb-11 flex h-11 w-full -translate-y-full transform-gpu touch-manipulation select-none items-center justify-center border-b border-highlight bg-surface-200 bg-gradient-to-t from-surface-200 via-surface-200 to-surface-300 font-semibold opacity-0 backdrop-blur-lg transition-transform"
      class:opacity-100={stuck}
      class:translate-y-0={stuck}
      class:pointer-events-none={!current}
    >
      {name}
    </button>
  </h2>
  <div class="p-4">
    <slot />
  </div>
</section>

<svelte:head>
  {#if current && stuck}
    <meta
      name="theme-color"
      content="#{$flipped ? '121212' : 'f7f7f7'}"
      media="(prefers-color-scheme: light)"
    />
    <meta
      name="theme-color"
      content="#{$flipped ? 'f7f7f7' : '121212'}"
      media="(prefers-color-scheme: dark)"
    />
  {/if}
</svelte:head>

<style>
  /* Safari 15 fix for `position: fixed;` */
  @media not all and (min-resolution: 0.001dpcm) {
    @supports (-webkit-appearance: none) and (stroke-color: transparent) {
      .fixed {
        left: 0;
      }
    }
  }
</style>
