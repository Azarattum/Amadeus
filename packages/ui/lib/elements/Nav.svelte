<script lang="ts">
  import {
    Separator,
    Header,
    VStack,
    HStack,
    Spacer,
    Logo,
  } from "@amadeus-music/ui";

  export let section: string;

  let pane = $$slots.default;
</script>

<nav class="h-screen {pane ? 'hidden sm:flex' : 'flex'}">
  <VStack center>
    <Logo sm={pane ? "auto" : false} />
    <Separator />
    <HStack grow>
      {#if pane}
        <VStack gap="xl" p>
          <slot />
        </VStack>
      {/if}
      <div class="min-w-[15rem] {pane ? 'hidden xl:flex' : 'flex'}">
        <Separator />
        <VStack gap="sm" p grow>
          <Header>{section}</Header>
          <slot name="section" />
          <Spacer />
          <VStack center>
            <slot name="bottom" />
          </VStack>
        </VStack>
      </div>
    </HStack>
  </VStack>
  <Separator vertical />
</nav>
<nav
  class="fixed bottom-0 h-12 w-screen flex-col justify-between {pane
    ? 'flex sm:hidden'
    : 'hidden'}"
>
  <Separator vertical={false} />
  <HStack>
    <slot />
  </HStack>
</nav>
