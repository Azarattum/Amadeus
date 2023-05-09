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
  import { history, search as query, tracks } from "$lib/data";
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { debounce } from "@amadeus-music/util/async";
  import History from "./history.svelte";
  import Tracks from "./tracks.svelte";
  import { page } from "$app/stores";
  import { search } from "$lib/trpc";
  import { onDestroy } from "svelte";

  let id = 0;
  let local: TrackDetails[] = [];
  let pages: TrackDetails[][] = [];

  $: $query = decodeURIComponent($page.url.hash.slice(1));
  $: update($query), log($query), (pages = []);
  $: tracks.search($query).then((x) => (local = x));
  $: remote = pages.length
    ? pages.flat()
    : Array.from<undefined>({ length: 10 });

  let unsubscribe = () => {};
  const log = debounce((x: string) => history.log(x), 2000);
  const next = () => search.next.mutate(id);
  const update = debounce((query: string) => {
    if (import.meta.env.SSR) return;
    unsubscribe();
    globalThis.history?.replaceState(null, "", "#" + query);
    if (!query) return;
    const page = ~~((innerHeight / 56) * 2.5);
    ({ unsubscribe } = search.tracks.subscribe(
      { query, page },
      {
        onData(data) {
          id = data.id;
          if (!data.results.length && data.progress < 1) return;
          pages[data.page] = data.results;
        },
      }
    ));
  });

  onDestroy(unsubscribe);
</script>

<Topbar title="Explore">
  <Header xl indent>Explore</Header>
</Topbar>

{#if $query}
  <Tracks {local} {remote} on:end={next} />
{:else}
  <History />
{/if}

<Portal to="bottom">
  <Panel>
    <When not sm>
      <Input bind:value={$query} stretch resettable placeholder="Search">
        <Icon name="search" />
      </Input>
    </When>
    <Group size={3} stretch>
      <Button>Tracks</Button>
      <Button>Artists</Button>
      <Button>Albums</Button>
    </Group>
  </Panel>
</Portal>

<svelte:head>
  <title>{$query || "Explore"} - Amadeus</title>
</svelte:head>
