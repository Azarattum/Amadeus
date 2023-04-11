<script lang="ts">
  import { getContext, onMount } from "svelte";

  export let name: string;
  const tabs = getContext<string[]>("tabs");
  tabs.push(name);

  let trigger: HTMLElement;
  let section: HTMLElement;
  let current = false;
  let stuck = false;

  const scrollUp = () => section.scrollTo({ top: 0, behavior: "smooth" });

  onMount(() => {
    if (location.hash === `#${name.toLowerCase()}`) section.scrollIntoView();
    const stuckObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((x) => {
          if (x.boundingClientRect.x) return;
          stuck = x.intersectionRatio < 0.8;
        }),
      { threshold: 0.8 }
    );
    const sectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((x) => {
          current = x.intersectionRatio > 0.5;
          if (x.intersectionRatio === 1) {
            location.hash = `#${name.toLowerCase()}`;
          }
        }),
      { threshold: [0, 0.5, 1] }
    );
    sectionObserver.observe(section);
    stuckObserver.observe(trigger);

    return () => (sectionObserver.disconnect(), stuckObserver.disconnect());
  });
</script>

<section
  bind:this={section}
  id={name.toLowerCase()}
  class="z-10 h-full w-full snap-start snap-always overflow-x-hidden overflow-y-scroll"
  class:[&~nav_div_a]:pointer-events-none={current && stuck}
  class:[&~nav_div_a]:-translate-y-full={current && stuck}
  class:[&~nav_div]:opacity-0={current && stuck}
  class:target={current}
>
  <div class="pointer-events-none h-0 p-11" bind:this={trigger} />
  <h2>
    <button
      tabindex="-1"
      on:click={scrollUp}
      class="fixed top-0 mb-11 flex h-11 w-full -translate-y-full transform-gpu touch-manipulation select-none items-center justify-center border-b border-highlight bg-surface-200 bg-gradient-to-t from-surface-200 via-surface-200 to-surface-300 font-semibold opacity-0 backdrop-blur-lg transition-transform"
      class:opacity-100={stuck}
      class:translate-y-0={stuck}
      class:pointer-events-none={!current}
    >
      {name}
    </button>
  </h2>
  <slot />
</section>

<svelte:head>
  {#if current && stuck}
    <meta
      name="theme-color"
      content="#f7f7f7"
      media="(prefers-color-scheme: light)"
    />
    <meta
      name="theme-color"
      content="#121212"
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
