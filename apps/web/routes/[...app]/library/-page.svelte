<script lang="ts">
  import {
    type EditEvent,
    Projection,
    Separator,
    Tooltip,
    Portal,
    Header,
    Button,
    Stack,
    Frame,
    Tabs,
    Icon,
    Text,
    Tab,
  } from "@amadeus-music/ui";
  import {
    playlists,
    playback,
    artists,
    library,
    tracks,
    search,
  } from "$lib/data";
  import PlaybackActions from "$lib/ui/PlaybackActions.svelte";
  import type { Track } from "@amadeus-music/protocol";
  import Collection from "$lib/ui/Collection.svelte";
  import Overview from "$lib/ui/Overview.svelte";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { navigating } from "$app/stores";
  import { goto } from "$app/navigation";

  export let visible = true;
  export let active = true;
  export let hash = "";
  export let page = "";

  $: if (visible && !$navigating && globalThis.location && !location?.hash) {
    goto("#playlists", { replaceState: true });
  }

  /* === Collection data === */
  let kind: "playlist" | "artist" | "" = "";
  let id = 0;

  $: id = active ? +hash || id : id;
  $: kind = active
    ? page.endsWith("/artist")
      ? "artist"
      : page.endsWith("/playlist")
      ? "playlist"
      : kind
    : kind;
  $: data =
    kind === "playlist"
      ? $playlists.find((x) => x.id === id)
      : kind === "artist"
      ? $artists.find((x) => x.id === id)
      : undefined;
  $: title = data ? `${data.title} - Amadeus` : "Amadeus";

  /* === Library Actions === */
  function edit({ detail: { action, after, item } }: EditEvent<Track>) {
    if (!item.entry) return;
    if (action === "rearrange") library.rearrange(item.entry, after?.entry);
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
    <Tracks
      timeline
      fixed
      tracks={$tracks}
      class="pt-4"
      on:action={({ detail }) => playback.push([detail], "last")}
      let:selected
    >
      <Icon of="last" slot="action" />
      <PlaybackActions {selected} />
      <Button air on:click={() => library.purge(selected.map((x) => x.entry))}>
        <Icon of="trash" /><Tooltip>Delete from Library</Tooltip>
      </Button>
    </Tracks>
  </Tab>
</Tabs>

<Projection at="playlist" ephemeral {title}>
  <Frame>
    <Collection of={data} style="playlist" on:edit={edit} let:selected>
      <Button air on:click={() => library.purge(selected.map((x) => x.entry))}>
        <Icon of="trash" /><Tooltip>Delete from Library</Tooltip>
      </Button>
    </Collection>
  </Frame>
</Projection>
<Projection at="artist" ephemeral {title}>
  <Frame>
    <Collection of={data} style="artist" />
  </Frame>
</Projection>

{#if active}
  <Portal to="navigation">
    <Header sm>Library</Header>
    <Button air primary={hash === "playlists"} href="/library#playlists">
      <Icon of="last" />Playlists
    </Button>
    <Button air primary={hash === "artists"} href="/library#artists">
      <Icon of="people" />Artists
    </Button>
    <Button air primary={hash === "timeline"} href="/library#timeline">
      <Icon of="clock" />Timeline
    </Button>
    {#if page.endsWith("playlist")}
      {#await playlists.get(+hash) then { title }}
        <Separator />
        <Button primary air><Icon of="disk" /><Text>{title}</Text></Button>
      {/await}
    {/if}
    {#if page.endsWith("artist")}
      {#await artists.get(+hash) then { title }}
        <Separator />
        <Button primary air><Icon of="person" /><Text>{title}</Text></Button>
      {/await}
    {/if}
  </Portal>
{/if}
