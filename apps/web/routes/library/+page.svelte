<script lang="ts">
  import { artists, playlists, search } from "$lib/data";
  import Playlists from "../../lib/ui/Playlists.svelte";
  import { Tab, Tabs, Stack } from "@amadeus-music/ui";
  import Artists from "../../lib/ui/Artists.svelte";
</script>

<Tabs>
  <Tab name="Playlists">
    <Stack grow p>
      <Playlists
        on:rearrange={({ detail }) =>
          playlists.rearrange(detail.id, detail.after)}
        on:create={() =>
          playlists.create({ title: Math.random().toString(36).slice(2) })}
        playlists={$playlists}
        filter={$search}
        expandable
        editable
      />
    </Stack>
  </Tab>
  <Tab name="Artists">
    <Stack grow p>
      <Artists artists={$artists} filter={$search} />
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
