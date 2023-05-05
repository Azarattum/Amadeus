<script lang="ts">
  import type { Either } from "../../internal/types";
  import { setContext } from "svelte";

  type $$Props = {
    gap?: boolean | "xs" | "sm" | "lg" | "xl" | "2xl";
    justify?: boolean;
    screen?: boolean;
    grow?: boolean;
    p?: boolean;
  } & Either<"baseline" | "center"> &
    Either<"x" | "z">;

  export let gap: $$Props["gap"] = false;
  export let baseline = false;
  export let justify = false;
  export let center = false;
  export let screen = false;
  export let grow = false;
  export let p = false;
  export let x = false;
  export let z = false;

  setContext("stack", x ? "x" : z ? "z" : "y");
</script>

<div
  class="
  {z ? 'grid' : 'flex'}
  {z ? '[&>*]:col-start-1 [&>*]:row-start-1' : ''}
  {center
    ? 'place-items-center'
    : baseline
    ? 'place-items-baseline'
    : !grow
    ? 'place-items-start'
    : ''}"
  class:justify-center={justify}
  class:flex-col={!x && !z}
  class:gap-0.5={gap === "xs"}
  class:gap-1={gap === "sm"}
  class:gap-2={gap === true}
  class:gap-4={gap === "lg"}
  class:gap-8={gap === "xl"}
  class:gap-16={gap === "2xl"}
  class:p-4={p === true}
  class:flex-grow={grow}
  class:h-[100dvh]={!x && !z && screen}
  class:w-[100dvw]={x && screen}
  class:max-w-[100dvw]={screen}
  class:max-h-[100dvh]={screen}
  class:overflow-auto={screen}
>
  <slot />
</div>
