<script lang="ts">
  import { Projection, Stack, Tabs, Tab } from "@amadeus-music/ui";
  import { playlists, artists, tracks, search } from "$lib/data";
  import Overview from "$lib/ui/Overview.svelte";
  import Playlist from "./playlist/-page.svelte";
  import Artist from "./artist/-page.svelte";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { navigating } from "$app/stores";
  import { goto } from "$app/navigation";

  export let visible = true;

  $: if (visible && !$navigating && globalThis.location && !location?.hash) {
    goto("#playlists", { replaceState: true });
  }
</script>

<Tabs>
  <Tab name="Playlists" {visible}>
    <Stack class="p-4">
      <Overview
        of={$playlists}
        expandable
        editable
        style="playlist"
        filter={$search}
        on:create={() =>
          playlists.create({ title: Math.random().toString(36).slice(2) })}
        on:rearrange={({ detail }) =>
          playlists.rearrange(detail.id, detail.after)}
      />
    </Stack>
  </Tab>
  <Tab name="Artists" {visible}>
    <Stack class="p-4">
      <Overview of={$artists} filter={$search} style="artist" />
    </Stack>
  </Tab>
  <Tab name="Timeline" {visible}>
    <Tracks timeline fixed tracks={$tracks} class="pt-4">
      <div><!-- /// TODO: add actions --></div>
    </Tracks>
  </Tab>
</Tabs>

<Projection at="playlist" ephemeral class="bg-surface">
  <Playlist />
</Projection>

<Projection at="artist" ephemeral class="bg-surface">
  <Artist />
</Projection>

<svelte:head>
  <title>Library - Amadeus</title>
</svelte:head>
