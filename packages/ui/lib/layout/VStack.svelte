<script lang="ts">
  export let gap: boolean | "sm" | "lg" | "xl" = false;
</script>

<div
  class="flex w-full flex-col"
  class:gap-1={gap === "sm"}
  class:gap-2={gap === true}
  class:gap-4={gap === "lg"}
  class:gap-8={gap === "xl"}
>
  <slot />
</div>
