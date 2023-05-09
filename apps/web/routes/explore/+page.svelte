<script lang="ts">
  import {
    Separator,
    Button,
    Portal,
    Header,
    Topbar,
    Spacer,
    Group,
    Stack,
    Input,
    Panel,
    Icon,
    When,
  } from "@amadeus-music/ui";
  import {
    history,
    library,
    playlists,
    search as query,
    tracks,
  } from "$lib/data";
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { debounce } from "@amadeus-music/util/async";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { page } from "$app/stores";
  import { search } from "$lib/trpc";
  import { onDestroy } from "svelte";

  let id = 0;
  let local: TrackDetails[] = [];
  let pages: TrackDetails[][] = [];
  let selected = new Set<TrackDetails>();

  $: $query = decodeURIComponent($page.url.hash.slice(1));
  $: update($query), log($query), (pages = []);

  $: tracks.search($query).then((x) => (local = x));
  $: remote = pages.length
    ? pages.flat()
    : Array.from<undefined>({ length: 10 });

  let unsubscribe = () => {};
  const log = debounce((x: string) => history.log(x), 2000);
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

  function save(tracks: TrackDetails[] | Set<TrackDetails>) {
    library.push([...tracks], $playlists[0].id);
    if (tracks == selected) {
      selected.clear();
      selected = selected;
    }
  }

  onDestroy(unsubscribe);
</script>

<Topbar title="Explore">
  <Header xl indent>Explore</Header>
</Topbar>

{#if $query}
  <Stack grow gap="lg">
    {#if local.length}
      <div>
        <Header sm indent>Library</Header>
        <Tracks fixed tracks={local}><Icon name="last" slot="action" /></Tracks>
      </div>
    {/if}
    <div>
      <Header sm indent>Search</Header>
      <Tracks
        fixed
        tracks={remote}
        bind:selected
        on:end={() => search.next.mutate(id)}
        on:action={({ detail }) => save([detail])}
      >
        <Icon name="save" slot="action" />
        <Button air stretch on:click={() => save(selected)}>
          <Icon name="save" />
        </Button>
      </Tracks>
    </div>
  </Stack>
{:else if $history.length}
  <div class="m-auto max-w-xl p-8 [&>*:first-child]:opacity-50">
    <Stack x baseline>
      <Header center sm>History</Header>
      <Spacer />
      <Button air on:click={() => history.clear()}>
        <Icon name="trash" />
      </Button>
    </Stack>
    <Separator />
    {#each $history.slice(0, 6) as entry}
      <Button air stretch href="#{entry.query}">{entry.query}</Button>
    {/each}
  </div>
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
