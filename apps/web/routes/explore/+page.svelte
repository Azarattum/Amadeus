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
  import { history, library, playlists, search as query } from "$lib/data";
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { debounce } from "@amadeus-music/util/async";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { page } from "$app/stores";
  import { search } from "$lib/trpc";
  import { onDestroy } from "svelte";

  let id = 0;
  let pages: TrackDetails[][] = [];
  let selected = new Set<TrackDetails>();

  $: tracks = pages.flat();

  let unsubscribe = () => {};
  const update = debounce(() => {
    unsubscribe();
    const page = ~~((innerHeight / 56) * 2.5);
    ({ unsubscribe } = search.tracks.subscribe(
      { query: $query, page },
      {
        onData: (data) => {
          id = data.id;
          pages[data.page] = data.results;
          globalThis.history?.replaceState(null, "", "#" + $query);
        },
      }
    ));
  });
  const log = debounce(() => history.log($query).then(), 2000);
  $: ($query && (update(), log())) || (pages = []);

  function save(tracks: TrackDetails[] | Set<TrackDetails>) {
    library.push([...tracks], $playlists[0].id);
    if (tracks == selected) {
      selected.clear();
      selected = selected;
    }
  }

  $: $query = decodeURIComponent($page.url.hash.slice(1));
  $: if (!$query) globalThis.history?.replaceState(null, "", "#");

  onDestroy(unsubscribe);
</script>

<Topbar title="Explore">
  <Header xl indent>Explore</Header>
</Topbar>
{#if $query}
  <Header sm indent>Search</Header>
  <Tracks
    {tracks}
    bind:selected
    on:end={() => search.next.mutate(id)}
    on:action={({ detail }) => save([detail])}
  >
    <Icon name="save" slot="action" />
    <Button air stretch on:click={() => save(selected)}>
      <Icon name="save" />
    </Button>
  </Tracks>
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
  <title>Explore - Amadeus</title>
</svelte:head>
