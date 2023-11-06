<script lang="ts">
  import { setContext, onMount } from "svelte";
  import { tw } from "../../internal/tailwind";
  import { isiOS } from "../../internal/util";
  import { slide } from "svelte/transition";

  let classes = "";
  export { classes as class };

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
        easing: "ease-in-out",
        composite: "replace",
        fill: "forwards",
        duration: 150,
        delay: 1,
      },
    );
  }

  onMount(() => {
    if (!isiOS()) return;
    visualViewport?.addEventListener("resize", resize);
    return () => visualViewport?.removeEventListener("resize", resize);
  });
</script>

<aside
  class={tw`-z-20 mx-2 mb-2 flex min-h-[1px] w-[calc(100%-1rem)] max-w-xl flex-wrap rounded-lg bg-surface-200 ring-1 ring-highlight backdrop-blur-md will-change-transform ${classes}`}
  bind:this={panel}
  transition:slide
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
