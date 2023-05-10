<script lang="ts">
  import {
    Button,
    Portal,
    Header,
    Topbar,
    Group,
    Input,
    Panel,
    Icon,
    When,
  } from "@amadeus-music/ui";
  import type {
    AlbumDetails,
    ArtistDetails,
    TrackDetails,
  } from "@amadeus-music/protocol";
  import { artists, history, search as query, tracks } from "$lib/data";
  import { debounce } from "@amadeus-music/util/async";
  import { navigating, page } from "$app/stores";
  import History from "./history.svelte";
  import Artists from "./artists.svelte";
  import Albums from "./albums.svelte";
  import Tracks from "./tracks.svelte";
  import { search } from "$lib/trpc";
  import { onDestroy } from "svelte";

  const types = ["tracks", "artists", "albums"] as const;
  type Search<K, T> = { type: K; local: T[]; remote: T[][] | undefined };

  let id = 0;
  let type = 0;
  let results:
    | Search<"tracks", TrackDetails>
    | Search<"artists", ArtistDetails>
    | Search<"albums", AlbumDetails> = {
    type: types[type],
    remote: [],
    local: [],
  };

  $: navigate($page.url.hash.slice(1));
  $: lookup(type, $query);

  let unsubscribe = () => {};
  const log = debounce((x: string) => history.log(x), 2000);
  const next = () => search.next.mutate(id);
  const update = debounce(subscribe);

  async function lookup(type: number, query: string) {
    if (import.meta.env.SSR) return;
    unsubscribe();
    results = {
      type: types[type],
      remote: undefined,
      local: [],
    };
    if (!$navigating) {
      const hash = `#${types[type]}/${query}`;
      if (location.hash !== hash) {
        globalThis.history.replaceState(null, "", hash);
      }
    }
    if (!query) return;
    log(query);
    update(type, query);
    const store = [tracks, artists][type];
    results.local = await store.search(query);
  }

  function subscribe(type: number, query: string) {
    const page = ~~((innerHeight / 56) * 2.5);
    ({ unsubscribe } = search[types[type]].subscribe(
      { query, page },
      {
        onData(data) {
          id = data.id;
          if (!data.results.length && data.progress < 1) return;
          if (!results.remote) results.remote = [];
          results.remote[data.page] = data.results;
        },
      }
    ));
  }

  function navigate(hash: string) {
    const parts = decodeURIComponent(hash).split("/");
    if (parts.length < 2) return;
    type = types.indexOf(parts[0] as (typeof types)[number]);
    if (!~type) type = 0;
    if ($query !== parts[1]) $query = parts[1];
  }

  onDestroy(unsubscribe);
</script>

<Topbar title="Explore">
  <Header xl indent>Explore</Header>
</Topbar>

{#if $query}
  {#if results.type === "tracks"}
    <Tracks
      remote={results.remote?.flat()}
      local={results.local}
      on:end={next}
    />
  {:else if results.type === "artists"}
    <Artists
      remote={results.remote?.flat()}
      local={results.local}
      on:end={next}
    />
  {:else if results.type === "albums"}
    <Albums
      remote={results.remote?.flat()}
      local={results.local}
      on:end={next}
    />
  {/if}
{:else}
  <History type={types[type]} />
{/if}

<Portal to="bottom">
  <Panel>
    <When not sm>
      <Input bind:value={$query} stretch resettable placeholder="Search">
        <Icon name="search" />
      </Input>
    </When>
    <Group size={3} stretch bind:value={type}>
      <Button id="tracks">Tracks</Button>
      <Button id="artists">Artists</Button>
      <Button id="albums">Albums</Button>
    </Group>
  </Panel>
</Portal>

<svelte:head>
  <title>{$query || "Explore"} - Amadeus</title>
</svelte:head>
