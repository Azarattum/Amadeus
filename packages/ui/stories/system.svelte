<script>
  import HStack from "$lib/layout/HStack.svelte";
  import VStack from "$lib/layout/VStack.svelte";
</script>

<VStack gap="xl">
  <VStack gap="lg">
    <h2 class="text-2xl">Colors</h2>
    <VStack gap>
      <h2 class="text-xl">Primary</h2>
      <HStack gap>
        <div class="h-16 w-16 rounded-md bg-primary-100" />
        <div class="h-16 w-16 rounded-md bg-primary-200" />
        <div class="h-16 w-16 rounded-md bg-primary-300" />
        <div class="h-16 w-16 rounded-md bg-primary-400" />
        <div class="h-16 w-16 rounded-md bg-primary-500" />
        <div class="h-16 w-16 rounded-md bg-primary-600" />
        <div class="h-16 w-16 rounded-md bg-primary-700" />
        <div class="h-16 w-16 rounded-md bg-primary-800" />
        <div class="h-16 w-16 rounded-md bg-primary-900" />
      </HStack>
    </VStack>
    <VStack gap>
      <h2 class="text-xl">Content</h2>
      <HStack gap>
        <div class="h-16 w-16 rounded-md bg-content" />
        <div class="h-16 w-16 rounded-md bg-content-100" />
        <div class="h-16 w-16 rounded-md bg-content-200" />
      </HStack>
    </VStack>
    <VStack gap>
      <h2 class="text-xl">Highlight</h2>
      <HStack gap>
        <div class="bg-highlight h-16 w-16 rounded-md" />
        <div class="bg-highlight-100 h-16 w-16 rounded-md" />
        <div class="bg-highlight-200 h-16 w-16 rounded-md" />
      </HStack>
    </VStack>
    <VStack gap>
      <h2 class="text-xl">Surface</h2>
      <HStack gap>
        <div class="bg-surface h-16 w-16 rounded-md shadow" />
        <div class="bg-surface-100 h-16 w-16 rounded-md shadow" />
      </HStack>
    </VStack>
  </VStack>

  <VStack gap>
    <h2 class="text-2xl">Typography</h2>
    <HStack baseline gap>
      <div class="text-2xl">Header</div>
      <div class="text-xl">Sub Header</div>
      <div class="text-lg">Section</div>
      <div class="text-md">Base Content</div>
      <div class="text-sm">Secondary Content</div>
      <div class="text-xs">Tertiary Content</div>
      <div class="text-2xs">Label</div>
    </HStack>
  </VStack>
</VStack>
