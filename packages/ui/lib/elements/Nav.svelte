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
    <div class="hidden w-full flex-col items-center tall:flex">
      <Logo sm={pane ? "auto" : false} />
      <Separator />
    </div>
    <Stack x grow>
      {#if pane}
        <Stack gap="xl" p>
          <slot />
          <Spacer />
          <slot name="bottom" />
        </Stack>
      {/if}
      <div class="min-w-[15rem] {pane ? 'hidden xl:flex' : 'flex'}">
        <Separator />
        <Stack gap="sm" p grow>
          <Header>{section}</Header>
          <slot name="section" />
          <Spacer />
          <Stack center>
            <slot name="bottom-section" />
          </Stack>
        </Stack>
      </div>
    </Stack>
  </Stack>
  <Separator vertical />
</nav>
<nav
  class="fixed bottom-0 h-12 w-screen flex-col justify-between {pane
    ? 'flex sm:hidden'
    : 'hidden'}"
>
  <Separator vertical={false} />
  <Stack x>
    <slot />
  </Stack>
</nav>
