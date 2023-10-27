<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { isiOS } from "../../internal/util";
  import { slide } from "svelte/transition";

  setContext("panel", true);

  const offset = 8;
  let panel: HTMLElement | undefined;

  async function resize() {
    const viewport = (visualViewport?.height || innerHeight) - innerHeight;
    const focused = panel?.contains(document.activeElement);
    const animations = panel?.getAnimations() || [];
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
    const bottom = panel?.getBoundingClientRect().bottom || 0;
    const y = viewport - bottom + innerHeight - offset;

    panel?.animate(
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

<aside
  bind:this={panel}
  transition:slide
  class="-z-20 mx-2 mb-2 flex min-h-[1px] w-[calc(100%-1rem)] max-w-xl flex-wrap rounded-lg bg-surface-200 ring-1 ring-highlight backdrop-blur-md will-change-transform"
>
  <slot />
</aside>

<style>
  @media (pointer: coarse) {
    @supports (-webkit-touch-callout: none) {
      aside:focus-within {
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
