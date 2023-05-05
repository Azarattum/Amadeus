<script lang="ts">
  import { Card, Header, Stack, Virtual, Text, Icon } from "@amadeus-music/ui";
  import { playlists, artists } from "$lib/data";
  import Avatar from "$lib/ui/Avatar.svelte";

  /// TODO: this is bad! should be reworked on the data level!
  $: tracks = $playlists.flatMap((x) => x.tracks);
  $: grouped = $artists.map((x) => ({
    ...x,
    tracks: tracks.filter((y) => y.artists.find((z) => z.id === x.id)),
  }));
</script>

<Virtual key={(x) => x.id} items={grouped} columns="20rem" let:item gap={32}>
  <Card interactive href="/library/artist#{item.id}">
    <Header center>{item.title}</Header>
    <Stack x gap="lg">
      <Text secondary><Icon name="note" sm /> {item.tracks.length}</Text>
      <Text secondary><Icon name="clock" sm /> TODO</Text>
    </Stack>
    <Avatar round of={item} slot="after" />
  </Card>
</Virtual>
<!-- Loading State -->
{#if !$artists.length}
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8"
  >
    {#each Array.from({ length: 3 }) as _}
      <Card>
        <Header center loading>Loading</Header>
        <Stack x gap="lg">
          <Text secondary loading>Loading</Text>
          <Text secondary loading>Loading</Text>
        </Stack>
        <Avatar round slot="after" />
      </Card>
    {/each}
  </div>
{/if}
