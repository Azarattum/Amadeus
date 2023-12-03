<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";

  let classes: Classes = "";
  export { classes as class };
  export let secondary = false;
  export let loading = false;
  export let accent = false;
  export let indent = false;
  export let sm = false;
</script>

<span
  class={tw`w-max max-w-full truncate rounded-md text-left [&>*]:align-bottom
  ${loading && "animate-pulse bg-highlight text-transparent"}
  ${accent ? "font-medium" : "font-normal"}
  ${classes}`}
  class:text-content-200={secondary}
  class:ml-4={indent}
  class:text-sm={sm}
>
  <slot />
</span>
