<script lang="ts">
  import { setContext } from "svelte";

  const elements: HTMLAnchorElement[] = [];
  const tabs: string[] = [];
  let container = 0;

  $: offsets = elements.map((x) => x.offsetLeft);
  $: transforms = offsets.map((offset, i) => {
    const max = offsets.slice(-1)[0] + elements.slice(-1)[0].clientWidth;
    if (max < container) return "";
    const ratio = (container * i) / offset || 1;
    return `
      translate3d(${-offset}px,0,${-ratio + 1}px)
      scale(${ratio})
      translate3d(${offset}px,0,0)
    `;
  });

  setContext("tabs", tabs);
</script>

<main
  bind:clientWidth={container}
  class="grid h-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth"
  style="grid: auto / auto-flow 100%; perspective: 1px; perspective-origin: top left;"
>
  <slot />
  <nav
    class="absolute flex origin-top-left transition-opacity"
    style="transform-style: preserve-3d;"
    style:transform={transforms[0]
      ? ""
      : "translate3d(0,0,-99999px) scale(100000)"}
  >
    <!-- /// TODO: make actually clickable -->
    {#each tabs as tab, i}
      <a
        class="h-11 origin-top-left pt-11 pl-4 text-2xl transition-opacity"
        bind:this={elements[i]}
        href="#{tab.toLowerCase()}"
        style:transform={transforms[i]}
      >
        <div
          class="transform-gpu transition-composite duration-300 will-change-transform"
        >
          {tab}
        </div>
      </a>
    {/each}
  </nav>
</main>
