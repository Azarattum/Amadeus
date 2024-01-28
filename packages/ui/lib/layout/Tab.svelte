<script lang="ts">
  import { intersection, autoscroll } from "../../action";
  import type { IntersectionEvent } from "../../action";
  import { getContext, onMount } from "svelte";
  import { Topbar } from "../../component";

  export let visible = true;
  export let name: string;
  const tabs = getContext<string[]>("tabs");
  tabs.push(name);

  let article: HTMLElement;
  let current = false;
  let stuck = false;

  function changed({ detail }: IntersectionEvent) {
    if (tabs.length <= 1) return (current = true);
    current = detail.intersectionRatio > 0.5;
    if (visible && detail.intersectionRatio >= 0.999) {
      // Using Svelte's `goto` here breaks navigation!
      location.replace(`#${name.toLowerCase()}`);
    }
  }

  onMount(() => {
    if (location.hash === `#${name.toLowerCase()}`) article.scrollIntoView();
  });
</script>

<article
  class="relative z-10 size-full snap-start snap-always overflow-x-hidden overflow-y-scroll"
  id={name.toLowerCase()}
  class:[&~nav_div_a]:pointer-events-none={current && stuck}
  class:[&~nav_div_a]:-translate-y-full={current && stuck}
  class:[&~nav_div]:opacity-0={current && stuck}
  use:intersection={[0, 0.5, 0.999]}
  on:intersect={changed}
  class:target={current}
  bind:this={article}
  use:autoscroll
>
  <Topbar title={name} bind:stuck><div class="py-11" /></Topbar>
  <slot />
</article>
