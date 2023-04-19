<script lang="ts">
  import { Input, Icon, Stack, Button, Spacer } from "@amadeus-music/ui";
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { history, library, playlists } from "$lib/data";
  import { debounce } from "@amadeus-music/util/async";
  import { format } from "@amadeus-music/protocol";
  import { next, search } from "$lib/trpc";
  import { onDestroy } from "svelte";

  let results: TrackDetails[] = [];
  let query = "";
  let id = 0;

  let unsubscribe = () => {};
  const update = debounce(() => {
    unsubscribe();
    ({ unsubscribe } = search.subscribe(
      { type: "track", query, page: 5 },
      { onData: (x) => ({ id, results } = x) }
    ));
  });
  const log = debounce(() => history.log(query).then(), 2000);
  $: (query && (update(), log())) || (results = []);

  onDestroy(unsubscribe);
</script>

<Stack grow screen>
  <Input placeholder="Search" bind:value={query}><Icon name="search" /></Input>
  {#each results as track}
    <Stack x gap center>
      <img
        src={JSON.parse(track.album.art)[0]}
        width="48"
        height="48"
        alt="{format(track)} cover"
      />
      <div>{format(track)}</div>
      <Spacer />
      <Button on:click={() => library.push([track], $playlists[0].id)}>+</Button
      >
    </Stack>
  {/each}
  {#if results.length}
    <Button stretch on:click={() => next.mutate(id)}>More</Button>
  {/if}
</Stack>
