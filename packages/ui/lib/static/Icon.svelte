<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";
  import type { Either } from "../../internal/types";
  import { icons } from "../../icons";

  type $$Props = { of: keyof typeof icons; class?: Classes } & Either<
    "xxl" | "xs" | "sm" | "md" | "lg" | "xl"
  >;

  let classes: Classes = "";
  export { classes as class };
  export let of: keyof typeof icons;
  export let xs = false;
  export let sm = false;
  export let md = false;
  export let lg = false;
  export let xl = false;
  export let xxl = false;

  $: size = xxl ? 104 : xl ? 44 : lg ? 32 : sm ? 21 : xs ? 16 : md ? 28 : 24;
  $: symbol = String.fromCharCode(icons[of] + 0xf101);
</script>

<div
  class={tw`inline-block font-icon leading-none antialiased ${classes}`}
  aria-hidden="true"
  style:font-size="{size}px"
>
  {symbol}
</div>
