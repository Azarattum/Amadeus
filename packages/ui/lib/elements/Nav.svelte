<script lang="ts">
  import { Separator, Header, Stack, Spacer, Logo } from "@amadeus-music/ui";

  export let section: string;

  let pane = $$slots.default;
</script>

<nav
  class="h-screen flex-shrink-0 overflow-y-auto overflow-x-hidden {pane
    ? 'hidden sm:flex'
    : 'flex'}"
>
  <Stack>
    <div
      class="hidden w-full flex-col items-center tall:flex"
      aria-hidden="true"
    >
      <Logo sm={pane ? "auto" : false} />
      <Separator />
    </div>
    <Stack x grow>
      {#if pane}
        <Stack gap="xl" p>
          <slot />
          <Spacer />
          <div class="contents"><slot name="bottom" /></div>
        </Stack>
      {/if}
      <section class="min-w-[15rem] {pane ? 'hidden xl:flex' : 'flex'}">
        {#if pane}
          <Separator />
        {/if}
        <Stack gap="sm" p grow>
          <Header sm>{section}</Header>
          <div class="contents"><slot name="section" /></div>
          <Spacer />
          <Stack center>
            <slot name="bottom-section" />
          </Stack>
        </Stack>
      </section>
    </Stack>
  </Stack>
  <Separator vertical />
</nav>
<nav
  class="bg-surface-200 fixed bottom-0 z-50 h-12 w-full flex-col justify-between backdrop-blur-lg {pane
    ? 'flex sm:hidden'
    : 'hidden'}"
>
  <Separator vertical={false} />
  <Stack x>
    <slot />
  </Stack>
</nav>
