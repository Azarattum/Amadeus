<script lang="ts">
  import type { Either } from "../../internal/types";
  type $$Props = Either<"sm" | "md" | "lg" | "xl">;

  export let sm = false;
  export let md = false;
  export let lg = false;
  export let xl = false;
</script>

<div
  class="hidden"
  class:sm:contents={sm}
  class:md:contents={md}
  class:lg:contents={lg}
  class:xl:contents={xl}
>
  <slot />
</div>
