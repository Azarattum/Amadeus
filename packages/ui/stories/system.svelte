<script>
  import { Stack } from "@amadeus-music/ui";
</script>

<Stack gap="xl">
  <Stack gap="lg">
    <h2 class="text-2xl">Colors</h2>
    <Stack gap>
      <h2 class="text-xl">Primary</h2>
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
      <h2 class="text-xl">Content</h2>
      <Stack x gap>
        <div class="h-16 w-16 rounded-md bg-content" />
        <div class="h-16 w-16 rounded-md bg-content-100" />
        <div class="h-16 w-16 rounded-md bg-content-200" />
      </Stack>
    </Stack>
    <Stack gap>
      <h2 class="text-xl">Highlight</h2>
      <Stack x gap>
        <div class="h-16 w-16 rounded-md bg-highlight" />
        <div class="h-16 w-16 rounded-md bg-highlight-100" />
        <div class="h-16 w-16 rounded-md bg-highlight-200" />
      </Stack>
    </Stack>
    <Stack gap>
      <h2 class="text-xl">Surface</h2>
      <Stack x gap>
        <div class="h-16 w-16 rounded-md bg-surface shadow" />
        <div class="h-16 w-16 rounded-md bg-surface-100 shadow" />
      </Stack>
    </Stack>
  </Stack>

  <Stack gap>
    <h2 class="text-2xl">Typography</h2>
    <Stack x baseline gap>
      <div class="text-2xl">Header</div>
      <div class="text-xl">Sub Header</div>
      <div class="text-lg">Section</div>
      <div class="text-md">Base Content</div>
      <div class="text-sm">Secondary Content</div>
      <div class="text-xs">Tertiary Content</div>
      <div class="text-2xs">Label</div>
    </Stack>
  </Stack>
</Stack>
