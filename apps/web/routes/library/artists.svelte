<script lang="ts">
  import { Card, Header, Stack, Virtual, Text, Icon } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/string";
  import Avatar from "$lib/ui/Avatar.svelte";
  import { artists } from "$lib/data";
</script>

<Virtual
  key={(x) => x.id}
  items={$artists}
  columns="20rem"
  let:item
  gap={32}
  animate
>
  <Card interactive href="/library/artist#{item.id}">
    <Header center>{item.title}</Header>
    <Stack x justify gap="lg">
      <Text secondary><Icon name="note" sm /> {item.tracks}</Text>
      <Text secondary><Icon name="clock" sm /> {format(item.length)}</Text>
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
