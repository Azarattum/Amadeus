<script lang="ts">
  import { isiOS } from "../../internal/util";
  import { onMount } from "svelte";

  export let offset = 0;

  let container: HTMLElement | undefined;

  async function resize() {
    const viewport = (visualViewport?.height || innerHeight) - innerHeight;
    const focused = container?.contains(document.activeElement);
    const animations = container?.getAnimations() || [];
    if (!viewport || !focused) {
      return animations.forEach((animation) => {
        animation.reverse();
        animation.addEventListener("finish", () => animation.cancel(), {
          once: true,
        });
      });
    }

    animations.forEach((x) => x.cancel());
    await new Promise((r) => requestAnimationFrame(r));
    const bottom = container?.getBoundingClientRect().bottom || 0;
    const y = viewport - bottom + innerHeight - offset;

    container?.animate(
      [
        { transform: `translate3d(0,0,0)` },
        { transform: `translate3d(0,${y}px,0)` },
      ],
      {
        delay: 1,
        duration: 150,
        fill: "forwards",
        composite: "replace",
        easing: "ease-in-out",
      }
    );
  }

  onMount(() => {
    if (!isiOS()) return;
    visualViewport?.addEventListener("resize", resize);
    return () => visualViewport?.removeEventListener("resize", resize);
  });
</script>

<div bind:this={container} class="h-full w-full">
  <slot />
</div>

<style>
  @media (pointer: coarse) {
    @supports (-webkit-touch-callout: none) {
      div:focus-within {
        animation: elevate 1ms 1;
      }
    }
  }

  @keyframes elevate {
    0% {
      transform: translate3d(0, -100vh, 0);
    }
  }
</style>
