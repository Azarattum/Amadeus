<script lang="ts">
  import {
    Card,
    Header,
    Image,
    Text,
    Icon,
    Stack,
    Virtual,
    Topbar,
    Button,
    When,
  } from "@amadeus-music/ui";
  import { feed } from "$lib/data";
  import { onMount } from "svelte";

  const types: Record<number, string> = { 0: "Listened", 1: "Recommended" };
  onMount(() => {
    if (!location.hash) location.replace("#feed");
  });
</script>

<Topbar title="Home">
  <Header xl indent id="feed">
    Home
    <When not sm slot="after">
      <Button round href="/settings"><Icon name="settings" /></Button>
    </When>
  </Header>
</Topbar>
<Stack p grow gap="lg">
  <Header sm>Other Devices</Header>
  <!-- /// TODO add playback stuff -->
  <!-- /// Do proper prerendering -->
  <Virtual key={(x) => x.type} items={$feed} columns="20rem" let:item gap={16}>
    <!-- /// TODO replace with in-app card component -->
    <Card interactive href="/feed#{item.type}">
      <Header center id="added">{types[item.type]}</Header>
      <Stack x gap="lg">
        <Text secondary><Icon name="note" sm /> {item.tracks.length}</Text>
        <Text secondary><Icon name="clock" sm /> TODO</Text>
      </Stack>
      <div
        slot="after"
        class="grid aspect-square w-max shrink-0 grid-cols-2 gap-2 overflow-hidden rounded-2xl shadow-xl"
      >
        {#each item.tracks.slice(0, 4) as track}
          <Image src={track.album.art} />
        {/each}
      </div>
    </Card>
  </Virtual>

  <Header id="following" sm>New for You</Header>
  <!-- /// TODO add artists cards -->
</Stack>

<svelte:head>
  <title>Amadeus</title>
</svelte:head>
