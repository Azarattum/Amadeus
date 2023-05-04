<script lang="ts">
  import {
    Text,
    Icon,
    Stack,
    Spacer,
    Button,
    Topbar,
    Header,
  } from "@amadeus-music/ui";
  import Tracks, { type EditEvent } from "$lib/ui/Tracks.svelte";
  import { library, playlists } from "$lib/data";
  import { page } from "$app/stores";

  $: playlist = $playlists.find((x) => x.id === +$page.url.hash.slice(1));
  $: title = playlist?.playlist || "Loading";
  $: tracks = playlist?.tracks.filter((x) => x.id) || [];

  let selected = new Set<(typeof tracks)[number]>();

  function edit({
    detail: { action, index, item },
  }: EditEvent<(typeof tracks)[number]>) {
    if (action === "rearrange") {
      library.rearrange(item.entry, tracks[index - 1]?.entry);
    }
  }

  function purge() {
    library.purge([...selected].map((x) => x.entry));
    selected.clear();
    selected = selected;
  }
</script>

<Stack gap="lg" grow>
  <Stack gap>
    <Topbar {title}>
      <Header xl indent>{title}</Header>
    </Topbar>
    <Stack x gap="lg">
      <Text indent secondary><Icon name="note" sm /> {tracks.length}</Text>
      <Text secondary><Icon name="clock" sm /> TODO</Text>
      <Spacer />
      {#if playlist?.remote}
        <Text secondary><Icon name="share" sm /> {playlist?.remote}</Text>
      {/if}
    </Stack>
  </Stack>

  <Tracks {tracks} on:edit={edit} bind:selected>
    <Icon name="last" slot="action" />
    <Button air stretch on:click={purge}><Icon name="trash" /></Button>
  </Tracks>
</Stack>
