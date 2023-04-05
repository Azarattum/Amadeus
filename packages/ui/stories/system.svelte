<script>
  import { Stack, Header } from "@amadeus-music/ui";
</script>

<Stack gap="xl">
  <Stack gap="lg">
    <Header xl>Colors</Header>
    <Stack gap>
      <Header lg>Primary</Header>
      <Stack x gap>
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
    <Stack gap>
      <Header lg>Content</Header>
      <Stack x gap>
        <div class="h-16 w-16 rounded-md bg-content" />
        <div class="h-16 w-16 rounded-md bg-content-100" />
        <div class="h-16 w-16 rounded-md bg-content-200" />
      </Stack>
    </Stack>
    <Stack gap>
      <Header lg>Highlight</Header>
      <Stack x gap>
        <div class="h-16 w-16 rounded-md bg-highlight" />
        <div class="h-16 w-16 rounded-md bg-highlight-100" />
        <div class="h-16 w-16 rounded-md bg-highlight-200" />
      </Stack>
    </Stack>
    <Stack gap>
      <Header lg>Surface</Header>
      <Stack x gap>
        <div class="h-16 w-16 rounded-md bg-surface shadow" />
        <div class="h-16 w-16 rounded-md bg-surface-100 shadow" />
      </Stack>
    </Stack>
    <Header lg>Glass</Header>
    <Stack z center>
      <div class="bg-surface-200 z-50 h-20 w-20 rounded-md backdrop-blur-lg" />
      <Stack x>
        <Stack>
          <div class="h-16 w-16 rounded-tl-md bg-content" />
          <div class="h-16 w-16 rounded-bl-md bg-primary-600" />
        </Stack>
        <Stack>
          <div class="h-16 w-16 rounded-tr-md bg-primary-300" />
          <div class="h-16 w-16 rounded-br-md bg-primary-900" />
        </Stack>
      </Stack>
    </Stack>
  </Stack>

  <Stack gap>
    <Header xl>Typography</Header>
    <Stack x baseline gap>
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
