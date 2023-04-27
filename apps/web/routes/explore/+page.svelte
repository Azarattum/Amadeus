<script lang="ts">
  import { history, library, playlists, search as query } from "$lib/data";
  import { Header, Stack, Button, Icon } from "@amadeus-music/ui";
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { debounce } from "@amadeus-music/util/async";
  import Tracks from "$lib/ui/Tracks.svelte";
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

  onDestroy(unsubscribe);
</script>

<Stack p gap>
  <Header xl>Search</Header>
</Stack>
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
