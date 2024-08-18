<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";
  import { autoscroll } from "../../action";
  import { Morph } from ".";

  let classes: Classes = "";
  export { classes as class };
  export let morph: string | undefined = undefined;
</script>

<Morph container key={morph}>
  <div class="size-full rounded-2xl bg-surface contain-strict">
    <div
      class={tw`absolute inset-0 overflow-y-auto overflow-x-hidden will-change-transform ${classes}`}
      use:autoscroll
    >
      <slot />
    </div>
  </div>
</Morph>
