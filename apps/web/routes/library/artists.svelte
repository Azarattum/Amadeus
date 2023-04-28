<script lang="ts">
  import {
    Card,
    Header,
    Stack,
    Virtual,
    Text,
    Icon,
    Image,
  } from "@amadeus-music/ui";
  import { playlists, artists } from "$lib/data";

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
    <div
      slot="after"
      class="aspect-square w-max shrink-0 overflow-hidden rounded-full shadow-xl"
    >
      <Image size={104} src={item.art} />
    </div>
  </Card>
</Virtual>
