<script lang="ts">
  import { tw } from "../../internal/tailwind";
  import { autoscroll } from "../../action";

  let classes = "";
  export { classes as class };
</script>

<div
  class={tw`h-full w-full overflow-y-auto overflow-x-hidden bg-surface ${classes}`}
  use:autoscroll
>
  <slot />
</div>
