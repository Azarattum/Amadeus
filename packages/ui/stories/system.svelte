<script>
  import { Header, Stack } from "@amadeus-music/ui";
</script>

<Stack class="h-full overflow-auto">
  <Stack class="gap-4">
    <Header xl>Colors</Header>
    <Stack class="gap-2">
      <Header lg>Primary</Header>
      <Stack x class="gap-2">
        <div class="h-16 w-16 rounded-md bg-primary-100" />
        <div class="h-16 w-16 rounded-md bg-primary-200" />
        <div class="h-16 w-16 rounded-md bg-primary-300" />
        <div class="h-16 w-16 rounded-md bg-primary-400" />
        <div class="h-16 w-16 rounded-md bg-primary-500" />
        <div class="h-16 w-16 rounded-md bg-primary-600" />
        <div class="h-16 w-16 rounded-md bg-primary-700" />
        <div class="h-16 w-16 rounded-md bg-primary-800" />
        <div class="h-16 w-16 rounded-md bg-primary-900" />
      </Stack>
    </Stack>
    <Stack class="gap-2">
      <Header lg>Surface</Header>
      <Stack z class="place-items-center">
        <Stack x>
          <Stack>
            <div class="h-16 w-32 rounded-tl-md bg-primary-400" />
            <div class="h-16 w-32 rounded-bl-md bg-primary-600" />
          </Stack>
          <Stack>
            <div class="h-16 w-32 rounded-tr-md bg-primary-300" />
            <div class="h-16 w-32 rounded-br-md bg-primary-900" />
          </Stack>
        </Stack>
        <Stack x class="gap-2">
          <div class="h-16 w-16 rounded-md bg-surface" />
          <div
            class="h-16 w-16 rounded-md bg-surface-100 shadow-lg dark:shadow-none"
          />
          <div
            class="z-50 h-16 w-16 rounded-md bg-surface-200 backdrop-blur-md"
          />
        </Stack>
      </Stack>
    </Stack>
    <Stack class="gap-2">
      <Header lg>Content</Header>
      <Stack x class="gap-2">
        <div class="h-16 w-16 rounded-md bg-content" />
        <div class="h-16 w-16 rounded-md bg-content-100" />
        <div class="h-16 w-16 rounded-md bg-content-200" />
      </Stack>
    </Stack>
    <Stack class="gap-2">
      <Header lg>Highlight</Header>
      <Stack x class="gap-2">
        <div class="h-16 w-16 rounded-md bg-highlight" />
        <div class="h-16 w-16 rounded-md bg-highlight-100" />
        <div class="h-16 w-16 rounded-md bg-highlight-200" />
      </Stack>
    </Stack>
  </Stack>

  <Stack class="gap-2">
    <Header xl>Typography</Header>
    <Stack x class="place-items-baseline gap-2">
      <div class="text-2xl">Header 1</div>
      <div class="text-xl">Header 2</div>
      <div class="text-lg">Header 3</div>
      <div class="text-md">Content 1</div>
      <div class="text-sm">Content 2</div>
      <div class="text-xs">Content 3</div>
      <div class="text-2xs">Label</div>
    </Stack>
  </Stack>
</Stack>
