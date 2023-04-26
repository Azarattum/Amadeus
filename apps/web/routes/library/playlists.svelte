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
  import { playlists } from "$lib/data";
</script>

<Virtual
  items={$playlists}
  key={(x) => x.id}
  let:item
  columns="20rem"
  gap={32}
  sortable
>
  <Card interactive href="/library/playlist#{item.id}">
    <Header center>{item.playlist}</Header>
    <Stack x gap="lg">
      <Text secondary><Icon name="note" sm /> {item.tracks.length}</Text>
      <Text secondary><Icon name="clock" sm /> TODO</Text>
    </Stack>
    <div
      slot="after"
      class="grid aspect-square w-max shrink-0 grid-cols-2 gap-2 overflow-hidden rounded-2xl shadow-xl"
    >
      {#each item.tracks.slice(0, 4) as track}
        <Image src={track.album.art} alt="Album Preview" />
      {/each}
    </div>
  </Card>
</Virtual>
