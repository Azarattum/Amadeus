<script lang="ts">
  import { Tab, Tabs, Stack } from "@amadeus-music/ui";
  import Playlists from "./playlists.svelte";
  import Artists from "./artists.svelte";
</script>

<Tabs>
  <Tab name="Playlists">
    <Stack grow p>
      <Playlists />
    </Stack>
  </Tab>
  <Tab name="Artists">
    <Stack grow p>
      <Artists />
    </Stack>
  </Tab>
  <Tab name="Timeline">
    <Stack grow p>
      <div
        class="animate-bounce text-center text-xl font-extralight opacity-50"
      >
        Coming soon...
      </div>
    </Stack>
  </Tab>
</Tabs>

<svelte:head>
  <title>Library - Amadeus</title>
</svelte:head>
