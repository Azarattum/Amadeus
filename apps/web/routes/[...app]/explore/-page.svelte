<script lang="ts">
  import {
    Projection,
    Separator,
    Button,
    Portal,
    Header,
    Topbar,
    Group,
    Input,
    Panel,
    Frame,
    Text,
    Icon,
  } from "@amadeus-music/ui";
  import { search as query, artists, history, albums, tracks } from "$lib/data";
  import type { Artist, Album, Track } from "@amadeus-music/protocol";
  import { debounce } from "@amadeus-music/util/async";
  import { streams, search, expand } from "$lib/trpc";
  import { nully } from "@amadeus-music/util/string";
  import { multistream, stream } from "$lib/stream";
  import { navigating } from "$app/stores";
  import Overview from "./overview.svelte";
  import History from "./history.svelte";
  import Tracks from "./tracks.svelte";
  import { Media } from "$lib/ui";

  export let visible = true;
  export let active = true;
  export let hash = "";
  export let page = "";

  let title = "";

  $: visible && navigate(hash);
  $: if (visible && !$navigating) {
    globalThis.history?.replaceState(null, "", `#${types[type]}/${$query}`);
  }

  /* === Search data === */
  let type = 0;
  const types = ["tracks", "artists", "albums"] as const;
  const log = debounce((x: string) => history.log(x), 2000);
  const estimate = ~~((globalThis.innerHeight / 56) * 2);
  const remote = multistream(
    { artists: search.artists, tracks: search.tracks, albums: search.albums },
    streams.next,
    types[type],
  );

  $: remote.choose(types[type]);
  $: remote.update($query ? { page: estimate, query: $query } : null);

  let localTracks: Track[] = [];
  let localAlbums: Album[] = [];
  let localArtists: Artist[] = [];
  $: tracks.search($query).then((x) => (localTracks = x));
  $: albums.search($query).then((x) => (localAlbums = x));
  $: artists.search($query).then((x) => (localArtists = x));

  $: log($query);

  function navigate(hash: string) {
    const parts = decodeURIComponent(hash).split("/");
    if (parts.length < 2) return;
    type = types.indexOf(parts[0] as (typeof types)[number]);
    if (!~type) type = 0;
    if ($query !== parts[1]) $query = parts[1];
  }

  /* === Collection data === */
  let kind: "artist" | "album" | "" = "";
  let id = 0;

  $: id = active ? +hash || id : id;
  $: kind = active
    ? page.endsWith("/artist")
      ? "artist"
      : page.endsWith("/album")
        ? "album"
        : kind
    : kind;
  /// TODO: when migrating to Svelte 5, kind checks will no longer be needed
  $: album = kind === "album" ? stream(expand.album, streams.next) : undefined;
  $: artist =
    kind === "artist" ? stream(expand.artist, streams.next) : undefined;
  $: (album ?? artist)?.update({ page: estimate, id });
  $: title =
    nully`${($album ?? $artist)?.detail?.title} - Amadeus` || "Amadeus";
</script>

<Frame>
  <Topbar title="Explore">
    <Header indent xl>Explore</Header>
  </Topbar>

  {#if $query}
    {#if $remote.type === "tracks"}
      <Tracks remote={$remote.data} local={localTracks} on:end={remote.next} />
    {:else if $remote.type === "artists"}
      <Overview
        remote={$remote.data}
        local={localArtists}
        style="artist"
        on:end={remote.next}
      />
    {:else if $remote.type === "albums"}
      <Overview
        remote={$remote.data}
        local={localAlbums}
        style="album"
        on:end={remote.next}
      />
    {/if}
  {:else}
    <History type={types[type]} />
  {/if}
</Frame>

<Portal to="panel">
  <Panel class={visible ? "flex" : "hidden"}>
    <Input
      resettable
      class="w-full sm:hidden"
      placeholder="Search"
      bind:value={$query}
    >
      <Icon of="search" />
    </Input>
    <Group size={3} bind:value={type}>
      <Button id="search-tracks">Tracks</Button>
      <Button id="search-artists">Artists</Button>
      <Button id="search-albums">Albums</Button>
    </Group>
  </Panel>
</Portal>

<Projection at="album" ephemeral {title}>
  <Frame morph={nully`album-${$album?.detail?.id}`}>
    <Media.Collection
      album={$album?.detail}
      tracks={$album}
      on:end={() => album?.next()}
    />
  </Frame>
</Projection>
<Projection at="artist" ephemeral {title}>
  <Frame morph={nully`artist-${$artist?.detail?.id}`}>
    <Media.Collection
      artist={$artist?.detail}
      tracks={$artist}
      on:end={() => artist?.next()}
    />
  </Frame>
</Projection>

{#if active}
  <Portal to="navigation">
    <Header sm>Explore</Header>
    {#if page.endsWith("album") || page.endsWith("artist")}
      <Button air href="/explore#tracks/{$query}">
        <Icon of="note" />Tracks
      </Button>
      <Button air href="/explore#artists/{$query}">
        <Icon of="people" />Artists
      </Button>
      <Button air href="/explore#albums/{$query}">
        <Icon of="disk" />Albums
      </Button>
    {:else}
      <Button to="search-tracks" air><Icon of="note" />Tracks</Button>
      <Button to="search-artists" air><Icon of="people" />Artists</Button>
      <Button to="search-albums" air><Icon of="disk" />Albums</Button>
    {/if}
    {#if page.endsWith("album") && $artist?.detail?.title}
      <Separator />
      <Button primary air>
        <Icon of="disk" /><Text>{$artist.detail.title}</Text>
      </Button>
    {/if}
    {#if page.endsWith("artist") && $album?.detail?.title}
      <Separator />
      <Button primary air>
        <Icon of="person" /><Text>{$album.detail.title}</Text>
      </Button>
    {/if}
  </Portal>
{/if}
