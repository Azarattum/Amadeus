<script context="module" lang="ts">
  const nodes = new Map<string, Set<Element>>();

  function mark(node: Element, key: string) {
    if (key && !nodes.has(key)) nodes.set(key, new Set());
    let set = nodes.get(key)?.add(node);
    return {
      update(newKey: string) {
        if (newKey && !nodes.has(newKey)) nodes.set(newKey, new Set());
        set?.delete(node);
        set = nodes.get(newKey)?.add(node);
      },
      destroy: () => set?.delete(node),
    };
  }

  function opponent(node: Element, key: string) {
    return [...(nodes.get(key)?.values() || [])].find((x) => x !== node);
  }
</script>

<script lang="ts">
  export let animation: KeyframeAnimationOptions & { duration?: number } = {};
  export let key: string | undefined = undefined;
  export let container = false;
  export let marker = !key;
  $: config = {
    fill: "forwards",
    easing: "ease",
    duration: 300,
    id: "morph",
    ...animation,
    ...(marker ? { duration: 0, delay: 0 } : {}),
  } as const;

  function compute(from: Element, to?: Element | null, backwards = true) {
    const fallback = { opacity: 0 };
    const base = { transformOrigin: "top left", pointerEvents: "none" };
    if (!to) return { frames: backwards ? [fallback, {}] : [{}, fallback] };

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const fromStyle = getComputedStyle(from);
    const toStyle = getComputedStyle(to);

    const dh = toRect.height / fromRect.height;
    const dw = toRect.width / fromRect.width;
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;

    const roundedFrom = Number.parseFloat(fromStyle.borderRadius) || 0;
    const roundedTo = Number.parseFloat(toStyle.borderRadius) || 0;
    const bgFrom = fromStyle.backgroundColor;
    const bgTo = toStyle.backgroundColor;
    const colorFrom = fromStyle.color;
    const colorTo = toStyle.color;

    const style: Keyframe = { ...base };
    if (dx || dy || dw !== 1 || dh !== 1) {
      style.transform = `translate3d(${dx}px,${dy}px,0) scale(${dw},${dh})`;
    }
    if (roundedFrom !== roundedTo) {
      style.borderRadius = `${roundedTo / dw}px / ${roundedTo / dh}px`;
    }
    if (bgFrom !== bgTo) {
      style.backgroundColor = bgTo;
    }
    if (colorFrom !== colorTo) {
      style.color = colorTo;
    }

    return {
      inverse: (child: Element) => {
        const childRect = child.getBoundingClientRect();
        const originX = fromRect.x - childRect.x;
        const originY = fromRect.y - childRect.y;
        const length = Math.ceil((config.duration / 1000) * 120);
        return Array.from({ length }).map((_, i) => {
          let t = (1 / (length - 1)) * i;
          if (!backwards) t = 1 - t;
          return {
            transform:
              ` scale(${1 / ((1 - t) * dw + t)}, ${1 / ((1 - t) * dh + t)})` +
              ` translate3d(${(t - 1) * dx}px,${(t - 1) * dy}px,0)`,
            transformOrigin: `${originX}px ${originY}px`,
          };
        });
      },
      frames: backwards ? [style, base] : [base, style],
    };
  }

  async function morph(event: Event & { currentTarget: Element }) {
    if (marker || !key) return;
    const targets = opponent(event.currentTarget, key)?.children;
    const children = [...event.currentTarget.children];
    const backwards = event.type === "introstart";
    const tasks: [Element, Keyframe[]][] = [];
    await new Promise(requestAnimationFrame);

    children.forEach((element, i) => {
      // Reverse already running animations
      if (element.getAnimations().findLast(reverse)) {
        if (!container) return;
        return [...element.children].forEach((child) =>
          child.getAnimations().forEach(reverse),
        );
      }

      const target = targets?.item(i);
      const { inverse, frames } = compute(element, target, backwards);

      // Inverse children transforms for containers
      if (container && inverse) {
        [...element.children].forEach((child) => {
          tasks.push([child, inverse(child)]);
        });
      }
      tasks.push([element, frames]);
    });

    tasks.forEach(([element, frames]) => element.animate(frames, config));
  }

  function end({ currentTarget }: Event & { currentTarget: Element }) {
    if (marker) return;
    [...currentTarget.children].forEach((element) => {
      element.getAnimations().forEach((x) => x.cancel());
      if (!container) return;
      [...element.children].forEach((child) => {
        child.getAnimations().forEach((x) => x.cancel());
      });
    });
  }

  function reverse(animation: Animation) {
    if (animation.id !== config.id) return false;
    animation.reverse();
    return true;
  }

  function enable(_: unknown) {
    return { duration: config.duration, delay: config.delay };
  }
</script>

{#if key}
  <div
    class="contents"
    transition:enable|global
    on:outrostart={morph}
    on:introstart={morph}
    on:introend={end}
    use:mark={key}
  >
    <slot />
  </div>
{:else}
  <slot />
{/if}
