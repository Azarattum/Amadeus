<script lang="ts">
  import {
    Projection,
    Button,
    Portal,
    Header,
    Topbar,
    Group,
    Input,
    Panel,
    Icon,
  } from "@amadeus-music/ui";
  import { search as query, artists, history, albums, tracks } from "$lib/data";
  import type { Artist, Album, Track } from "@amadeus-music/protocol";
  import { debounce } from "@amadeus-music/util/async";
  import { navigating, page } from "$app/stores";
  import ArtistPage from "./artist/-page.svelte";
  import AlbumPage from "./album/-page.svelte";
  import { streams, search } from "$lib/trpc";
  import { multistream } from "$lib/stream";
  import Overview from "./overview.svelte";
  import History from "./history.svelte";
  import Tracks from "./tracks.svelte";

  export let visible = true;

  let type = 0;

  const types = ["tracks", "artists", "albums"] as const;
  const log = debounce((x: string) => history.log(x), 2000);
  const estimate = ~~((globalThis.innerHeight / 56) * 2);
  const remote = multistream(
    { artists: search.artists, tracks: search.tracks, albums: search.albums },
    streams.next,
    types[type],
  );

  $: visible && navigate($page.url.hash.slice(1));
  $: if (visible && !$navigating) {
    globalThis.history?.replaceState(null, "", `#${types[type]}/${$query}`);
  }

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
</script>

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

<Projection at="album" ephemeral class="bg-surface">
  <AlbumPage />
</Projection>
<Projection at="artist" ephemeral class="bg-surface">
  <ArtistPage />
</Projection>

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
    <Group stretch size={3} bind:value={type}>
      <Button id="search-tracks">Tracks</Button>
      <Button id="search-artists">Artists</Button>
      <Button id="search-albums">Albums</Button>
    </Group>
  </Panel>
</Portal>

<svelte:head>
  <title>{$query || "Explore"} - Amadeus</title>
</svelte:head>
