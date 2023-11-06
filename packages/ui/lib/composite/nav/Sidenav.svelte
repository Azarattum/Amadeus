<script lang="ts">
  import { Separator, Stack, Logo } from "../../../component";
  import { tw } from "../../../internal/tailwind";

  let classes = "";
  export { classes as class };

  const primary = $$slots.default;
  const secondary = $$slots.secondary;
</script>

<nav
  class={tw`flex h-[100dvh] flex-shrink-0 overflow-y-auto overflow-x-hidden ${classes}`}
>
  <Stack class="grow-0">
    <div
      class="hidden w-full flex-col items-center tall:flex"
      aria-hidden="true"
    >
      <Logo sm={primary ? (secondary ? "auto" : true) : false} />
      <Separator />
    </div>
    <Stack x>
      {#if primary}
        <Stack class="gap-8 p-4">
          <slot />
        </Stack>
      {/if}
      {#if secondary}
        <section class="w-[15rem] {primary ? 'hidden xl:flex' : 'flex'}">
          {#if primary}
            <Separator />
          {/if}
          <Stack class="max-w-full gap-1 p-4">
            <slot name="secondary" />
          </Stack>
        </section>
      {/if}
    </Stack>
  </Stack>
  <Separator vertical />
</nav>
