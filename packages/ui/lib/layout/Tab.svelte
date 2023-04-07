<script lang="ts">
  import type { Tabs } from "../elements/Tabs.svelte";
  import { getContext, tick } from "svelte";
  import { onMount } from "svelte";

  export let id = undefined as string | undefined;

  let { container, align } = getContext<Tabs>("tabs");
  let section: HTMLElement;
  let header: HTMLElement;
  let height = 0;
  let width = 0;

  $: aspect = $container.width / $container.height;
  $: reposition = 50 * ($container.width - width);
  $: ratio = $container.width / width;
  $: transform = `
    translate3d(0,0,-${ratio - 1}px)
    scale(${ratio})
    translate(
      calc(-${reposition / width}%),
      -${reposition / height / aspect}%
    )
  `;

  onMount(() => {
    const updated = align.target / align.count || width + align.gap * 1.5;
    header.style.width = updated + "px";
    align.target += width + align.gap;
    align.count += 1;

    tick().then(() => ((align.target = 0), (align.count = 0)));
    const observer = new IntersectionObserver((entries) =>
      entries.forEach((x) => x.isIntersecting && id && (location.hash = id))
    );
    observer.observe(section);
    return observer.disconnect.bind(observer);
  });
</script>

<section
  class="relative h-full w-full snap-start snap-always"
  style="transform-style: preserve-3d;"
  {id}
>
  <header
    class="absolute h-11 origin-top-left whitespace-nowrap text-2xl"
    bind:clientHeight={height}
    bind:clientWidth={width}
    bind:this={header}
    style:transform
  >
    <slot name="header" />
  </header>
  <div bind:this={section} class="absolute left-1/2 h-full" />
  <div class="mt-11 h-full overflow-x-hidden">
    <slot />
  </div>
</section>
