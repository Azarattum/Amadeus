<script lang="ts">
  import { Input, Icon, Stack, Button, Spacer } from "@amadeus-music/ui";
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { history, library, playlists } from "$lib/data";
  import { debounce } from "@amadeus-music/util/async";
  import { format } from "@amadeus-music/protocol";
  import { search } from "$lib/trpc";
  import { onDestroy } from "svelte";

  let pages: TrackDetails[][] = [];
  let query = "";
  let id = 0;

  let unsubscribe = () => {};
  const update = debounce(() => {
    unsubscribe();
    const page = ~~(innerHeight / 48);
    ({ unsubscribe } = search.tracks.subscribe(
      { query, page },
      {
        onData: (data) => {
          id = data.id;
          pages[data.page] = data.results;
        },
      }
    ));
  });
  const log = debounce(() => history.log(query).then(), 2000);
  $: (query && (update(), log())) || (pages = []);

  onDestroy(unsubscribe);
</script>

<Stack grow screen>
  <Input placeholder="Search" bind:value={query}><Icon name="search" /></Input>
  {#each pages as page, i (i)}
    {#each page as track}
      <Stack x gap center>
        <img
          src={JSON.parse(track.album.art)[0]}
          width="48"
          height="48"
          alt="{format(track)} cover"
        />
        <div>{format(track)}</div>
        <Spacer />
        <Button on:click={() => library.push([track], $playlists[0].id)}
          >+</Button
        >
      </Stack>
    {/each}
  {/each}
  {#if pages.length}
    <Button stretch on:click={() => search.next.mutate(id)}>More</Button>
  {/if}
</Stack>
