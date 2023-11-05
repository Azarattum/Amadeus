<script lang="ts">
  import { Tab, Tabs, Stack, Projection } from "@amadeus-music/ui";
  import { artists, playlists, tracks, search } from "$lib/data";
  import Overview from "$lib/ui/Overview.svelte";
  import Playlist from "./playlist/-page.svelte";
  import Artist from "./artist/-page.svelte";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { navigating } from "$app/stores";
  import { goto } from "$app/navigation";

  export let target = false;

  $: if (target && !$navigating && globalThis.location && !location?.hash) {
    goto("#playlists", { replaceState: true });
  }
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

<Projection at="playlist" class="bg-surface" ephemeral>
  <Playlist />
</Projection>

<Projection at="artist" class="bg-surface" ephemeral>
  <Artist />
</Projection>

<svelte:head>
  <title>Library - Amadeus</title>
</svelte:head>
