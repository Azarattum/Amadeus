<script lang="ts">
  import { onMount, setContext } from "svelte";

  const elements: HTMLElement[] = [];
  const tabs: string[] = [];
  setContext("tabs", tabs);

  let main: HTMLElement;
  let container = 0;

  $: offsets = elements.map((x) => x.offsetLeft);
  $: compact =
    offsets.slice(-1)[0] + elements.slice(-1)[0]?.clientWidth >= container;
  $: transforms = offsets.map((offset, i) => {
    if (!compact) return "";
    const ratio = (container * i) / offset || 1;
    return `
      translate3d(${-offset}px,-2.75rem,${-ratio + 1}px)
      scale(${ratio})
      translate3d(${offset}px,2.75rem,0)
    `;
  });

  onMount(() => {
    if (!location.hash.trim()) location.hash = tabs[0].toLowerCase();
    else {
      const temp = location.hash.slice(1);
      location.hash = "";
      location.hash = temp;
    }
  });

  function style() {
    return tabs
      .map(
        (x) =>
          `#${x.toLowerCase()}:target~nav>div[aria-label='${x}']{` +
          `color:hsl(var(--color-content));` +
          `font-weight:bold;` +
          `}`
      )
      .join("");
  }
</script>

<main
  bind:this={main}
  bind:clientWidth={container}
  class:scroll-smooth={compact}
  class="grid h-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll"
  style="grid: auto / auto-flow 100%; perspective: 1px; perspective-origin: top left;"
>
  <slot />
  <nav
    class="pointer-events-none absolute z-10 mt-11 flex origin-top-left transition-opacity"
    style="transform-style: preserve-3d;"
    style:transform={transforms[0]
      ? ""
      : "translate3d(0,-2.75rem,-99999px) scale(100000) translate3d(0,2.75rem,0)"}
  >
    {#each tabs as tab, i}
      <div
        class="h-11 origin-top-left overflow-hidden pl-4 text-center text-2xl font-normal text-content-200 underline-offset-4 transition-opacity duration-300 ease-in hover:text-content-100"
        style:transform={transforms[i]}
        bind:this={elements[i]}
        aria-label={tab}
      >
        <a
          href="#{tab.toLowerCase()}"
          class="pointer-events-auto block transform-gpu touch-manipulation select-none transition-composite duration-300 will-change-transform focus-visible:underline focus-visible:outline-none"
        >
          {tab}
        </a>
      </div>
    {/each}
  </nav>
</main>

<svelte:head>
  {#await style() then css}
    <svelte:element this="style">{css}</svelte:element>
  {/await}
</svelte:head>

<style>
  main::-webkit-scrollbar {
    display: none;
  }
  main {
    scrollbar-width: none;
  }
  div::after {
    content: attr(aria-label);
    visibility: hidden;
    font-weight: 700;
    display: block;
    height: 0;
  }
</style>
