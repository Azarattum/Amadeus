<script lang="ts">
  import type { Either } from "../../internal/types";
  type $$Props = Either<"sm" | "md" | "lg" | "xl"> & { not?: boolean };

  export let not = false;
  export let sm = false;
  export let md = false;
  export let lg = false;
  export let xl = false;
</script>

<div
  class={not ? "contents" : "hidden"}
  class:sm:contents={!not && sm}
  class:md:contents={!not && md}
  class:lg:contents={!not && lg}
  class:xl:contents={!not && xl}
  class:sm:hidden={not && sm}
  class:md:hidden={not && md}
  class:lg:hidden={not && lg}
  class:xl:hidden={not && xl}
>
  <slot />
</div>
