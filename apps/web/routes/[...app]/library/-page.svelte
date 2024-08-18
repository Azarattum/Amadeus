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
  import { PlaybackActions, Collection, Overview, Tracks } from "$lib/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { nully } from "@amadeus-music/util/string";
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
  let id: number | null = null;

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
  $: title = nully`${data?.title} - Amadeus` || "Amadeus";

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
    <Stack class="pt-4">
      <Tracks
        timeline
        tracks={$tracks}
        on:action={({ detail }) => playback.push([detail], "last")}
        let:selected
      >
        <Icon of="last" slot="action" />
        <PlaybackActions {selected} />
        <Button
          air
          on:click={() => library.purge(selected.map((x) => x.entry))}
        >
          <Icon of="trash" /><Tooltip>Delete from Library</Tooltip>
        </Button>
      </Tracks>
    </Stack>
  </Tab>
</Tabs>

<Projection at="playlist" ephemeral {title}>
  <Frame morph={nully`playlist-${id}`}>
    <Collection of={data} style="playlist" on:edit={edit} let:selected>
      <Button air on:click={() => library.purge(selected.map((x) => x.entry))}>
        <Icon of="trash" /><Tooltip>Delete from Library</Tooltip>
      </Button>
    </Collection>
  </Frame>
</Projection>
<Projection at="artist" ephemeral {title}>
  <Frame morph={nully`artist-${id}`}>
    <Collection
      of={data}
      href={nully`/explore/artist#${data?.id}`}
      style="artist"
    />
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
    {#if page.endsWith("playlist") && id !== null}
      {#await playlists.get(id) then { title }}
        <Separator />
        <Button primary air><Icon of="disk" /><Text>{title}</Text></Button>
      {/await}
    {/if}
    {#if page.endsWith("artist") && id !== null}
      {#await artists.get(id) then { title }}
        <Separator />
        <Button primary air><Icon of="person" /><Text>{title}</Text></Button>
      {/await}
    {/if}
  </Portal>
{/if}
