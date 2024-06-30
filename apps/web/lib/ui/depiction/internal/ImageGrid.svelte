<script lang="ts">
  import { type Classes, tw } from "@amadeus-music/ui";

  let classes: Classes = "";
  export { classes as class };
  export let href: string | undefined = undefined;

  const size = 104;
  const rounded = [
    "rounded-tl-2xl",
    "rounded-tr-2xl",
    "rounded-bl-2xl",
    "rounded-br-2xl",
  ];
</script>

<svelte:element
  this={href ? "a" : "div"}
  class={tw`grid shrink-0 grid-cols-[repeat(auto-fit,minmax(calc(50%-0.5rem),1fr))] gap-2 
  ${href && "outline outline-0 outline-highlight transition-[outline_transform] active:scale-95 hover:outline-8"}
  ${classes}`}
  {href}
  style:height="{size}px"
  style:width="{size}px"
>
  <slot {rounded} {size} />
</svelte:element>
