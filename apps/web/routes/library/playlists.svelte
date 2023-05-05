<script lang="ts">
  import { Card, Header, Stack, Virtual, Text, Icon } from "@amadeus-music/ui";
  import Avatar from "$lib/ui/Avatar.svelte";
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
    <Header center>{item.title}</Header>
    <Stack x gap="lg">
      <Text secondary><Icon name="note" sm /> {item.tracks.length}</Text>
      <Text secondary><Icon name="clock" sm /> TODO</Text>
    </Stack>
    <Avatar of={item.tracks} slot="after" />
  </Card>
</Virtual>
<!-- Loading State -->
{#if !$playlists.length}
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
        <Avatar slot="after" />
      </Card>
    {/each}
  </div>
{/if}
