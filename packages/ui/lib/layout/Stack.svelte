<script lang="ts">
  import type { Either } from "../../internal/types";
  import { setContext } from "svelte";

  type $$Props = {
    gap?: boolean | "sm" | "lg" | "xl";
    screen?: boolean;
    grow?: boolean;
    p?: boolean;
  } & Either<"baseline" | "center"> &
    Either<"x" | "z">;

  export let gap: $$Props["gap"] = false;
  export let baseline = false;
  export let center = false;
  export let screen = false;
  export let grow = false;
  export let p = false;
  export let x = false;
  export let z = false;

  setContext("stack", x ? "x" : z ? "z" : "y");
</script>

<div
  class="{z ? 'grid [&>*]:col-start-1 [&>*]:row-start-1' : 'flex'} {center
    ? 'place-items-center'
    : baseline
    ? 'place-items-baseline'
    : !grow
    ? 'place-items-start'
    : ''}"
  class:flex-col={!x && !z}
  class:gap-1={gap === "sm"}
  class:gap-2={gap === true}
  class:gap-4={gap === "lg"}
  class:gap-8={gap === "xl"}
  class:p-4={p === true}
  class:flex-grow={grow}
  class:max-w-[100dvw]={screen && (x || z)}
  class:max-h-[100dvh]={screen && !x}
>
  <slot />
</div>
