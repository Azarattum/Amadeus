<script lang="ts">
  import { autoscroll, intersection } from "../../action";
  import type { IntersectionEvent } from "../../action";
  import { getContext, onMount } from "svelte";
  import { Topbar } from "../../component";

  export let name: string;
  const tabs = getContext<string[]>("tabs");
  tabs.push(name);

  let section: HTMLElement;
  let current = false;
  let stuck = false;

  function changed({ detail }: IntersectionEvent) {
    if (tabs.length <= 1) return (current = true);
    current = detail.intersectionRatio > 0.5;
    if (detail.intersectionRatio >= 0.999) {
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
  use:autoscroll
  id={name.toLowerCase()}
  class="relative z-10 h-full w-full snap-start snap-always overflow-x-hidden overflow-y-scroll"
  class:[&~nav_div_a]:pointer-events-none={current && stuck}
  class:[&~nav_div_a]:-translate-y-full={current && stuck}
  class:[&~nav_div]:opacity-0={current && stuck}
  class:target={current}
>
  <Topbar title={name} bind:stuck><div class="py-11" /></Topbar>
  <slot />
</section>
