<script lang="ts">
  import { Header, Logo, VStack } from "@amadeus-music/ui";

  export let section: string;
</script>

<div
  class="outline-highlight-100 flex min-h-screen w-max flex-col outline outline-1"
>
  <Logo />
  <nav
    class="border-highlight-100 flex h-full flex-col items-center justify-between border-t p-4"
  >
    <VStack gap="sm">
      <Header>{section}</Header>
      <slot />
    </VStack>

    <slot name="bottom" />
  </nav>
</div>
