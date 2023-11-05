<script lang="ts">
  import { artists, playlists, tracks, search } from "$lib/data";
  import { Tab, Tabs, Stack } from "@amadeus-music/ui";
  import Overview from "$lib/ui/Overview.svelte";
  import Tracks from "$lib/ui/Tracks.svelte";
</script>

<Tabs>
  <Tab name="Playlists">
    <Stack class="p-4">
      <Overview
        on:rearrange={({ detail }) =>
          playlists.rearrange(detail.id, detail.after)}
        on:create={() =>
          playlists.create({ title: Math.random().toString(36).slice(2) })}
        style="playlist"
        filter={$search}
        of={$playlists}
        expandable
        editable
      />
    </Stack>
  </Tab>
  <Tab name="Artists">
    <Stack class="p-4">
      <Overview style="artist" of={$artists} filter={$search} />
    </Stack>
  </Tab>
  <Tab name="Timeline">
    <Tracks tracks={$tracks} timeline fixed class="pt-4">
      <div><!-- /// TODO: add actions --></div>
    </Tracks>
  </Tab>
</Tabs>

<svelte:head>
  <title>Library - Amadeus</title>
</svelte:head>
