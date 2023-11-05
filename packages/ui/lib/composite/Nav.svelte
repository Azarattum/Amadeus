<script lang="ts">
  import {
    Separator,
    Header,
    Spacer,
    Portal,
    Stack,
    Logo,
  } from "../../component";

  export let section: string;

  let pane = $$slots.default;
</script>

<Portal to="left">
  <nav
    class="h-[100dvh] flex-shrink-0 overflow-y-auto overflow-x-hidden {pane
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
      <Stack x>
        {#if pane}
          <Stack class="gap-8 p-4">
            <slot />
            <Spacer />
            <slot name="bottom" />
          </Stack>
        {/if}
        <section class="min-w-[15rem] {pane ? 'hidden xl:flex' : 'flex'}">
          {#if pane}
            <Separator />
          {/if}
          <Stack class="gap-1 p-4">
            <Header sm>{section}</Header>
            <slot name="section" />
            <Spacer />
            <Stack class="place-items-center">
              <slot name="bottom-section" />
            </Stack>
          </Stack>
        </section>
      </Stack>
    </Stack>
    <Separator vertical />
  </nav>
</Portal>
<Portal to="bottom">
  <nav
    class="h-12 w-full flex-col justify-between bg-surface-200 backdrop-blur-md
    {pane ? 'flex sm:hidden' : 'hidden'}"
  >
    <Separator vertical={false} />
    <Stack x class="max-h-11">
      <slot />
    </Stack>
  </nav>
</Portal>
