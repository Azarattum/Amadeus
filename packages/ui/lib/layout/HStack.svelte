<script lang="ts">
  export let gap: boolean | "lg" | "xl" = false;
  export let baseline = false;
</script>

<div
  class="flex"
  class:items-baseline={baseline}
  class:gap-2={gap === true}
  class:gap-4={gap === "lg"}
  class:gap-8={gap === "xl"}
>
  <slot />
</div>
