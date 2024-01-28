<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";
  import { autoscroll } from "../../action";
  import { Morph } from ".";

  let classes: Classes = "";
  export { classes as class };
  export let morph: string | undefined = undefined;
</script>

<Morph container key={morph}>
  <div class="size-full bg-surface contain-strict">
    <div
      class={tw`absolute inset-0 overflow-y-auto overflow-x-hidden ${classes}`}
      use:autoscroll
    >
      <slot />
    </div>
  </div>
</Morph>
