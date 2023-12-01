<script lang="ts">
  import { setContext } from "svelte";

  const elements: HTMLElement[] = [];
  const tabs: string[] = [];
  setContext("tabs", tabs);

  let container: HTMLElement;
  let width = 0;

  $: offsets = elements.map((x) => x.offsetLeft);
  $: compact =
    offsets.slice(-1)[0] + elements.slice(-1)[0]?.clientWidth >= width;
  $: transforms = offsets.map((offset, i) => {
    if (!compact) return "";
    const ratio = (width * i) / offset || 1;
    return `
      translate3d(${-offset}px,-2.75rem,${-ratio + 1}px)
      scale(${ratio})
      translate3d(${offset}px,2.75rem,0)
    `;
  });

  function style() {
    return tabs
      .map(
        (x) =>
          `:where(#${x.toLowerCase()}).target~nav>div>a{` +
          `color:hsl(var(--color-content-200));` +
          `pointer-events:auto;` +
          `font-weight:normal;` +
          `}` +
          `:where(#${x.toLowerCase()}:target~nav)>div[aria-label='${x}']>a,` +
          `#${x.toLowerCase()}.target~nav>div[aria-label='${x}']>a{` +
          `color:hsl(var(--color-content));` +
          `pointer-events:none;` +
          `font-weight:bold;` +
          `}`,
      )
      .join("");
  }
</script>

<section
  class="grid h-full max-h-[100dvh] snap-x snap-mandatory overflow-y-hidden overflow-x-scroll"
  style="grid: auto / auto-flow 100%; perspective: 1px; perspective-origin: top left;"
  class:scroll-smooth={compact}
  bind:clientWidth={width}
  bind:this={container}
>
  <slot />
  <nav
    class="pointer-events-none absolute z-10 mt-11 flex origin-top-left transition-opacity contain-layout"
    style="transform-style: preserve-3d;"
    style:transform={transforms[0]
      ? ""
      : "translate3d(0,-2.75rem,-99999px) scale(100000) translate3d(0,2.75rem,0)"}
  >
    {#each tabs as tab, i}
      <div
        class="pointer-events-none h-11 origin-top-left overflow-hidden pl-4 text-center text-2xl font-normal text-content-200 underline-offset-4 transition-opacity duration-300 ease-in"
        aria-label={tab}
        style:transform={transforms[i]}
        bind:this={elements[i]}
      >
        <a
          class="block transform-gpu touch-manipulation select-none transition-composite duration-300 will-change-transform focus-visible:underline focus-visible:outline-none hover:text-content-100"
          href="#{tab.toLowerCase()}"
        >
          {tab}
        </a>
      </div>
    {/each}
  </nav>
</section>

<svelte:head>
  {#await style() then css}
    <svelte:element this="style">{css}</svelte:element>
  {/await}
</svelte:head>

<style>
  section::-webkit-scrollbar {
    display: none;
  }
  section {
    scrollbar-width: none;
  }
  div::after {
    content: attr(aria-label);
    visibility: hidden;
    font-weight: 700;
    display: block;
    height: 0;
  }
  :where(div) > a {
    pointer-events: auto;
  }
</style>
