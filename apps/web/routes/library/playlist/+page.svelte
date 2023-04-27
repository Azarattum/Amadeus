<script lang="ts">
  import { Text, Icon, Stack, Spacer, Header, Button } from "@amadeus-music/ui";
  import Tracks, { type EditEvent } from "$lib/ui/Tracks.svelte";
  import { hash } from "@amadeus-music/ui/internal/page";
  import { library, playlists } from "$lib/data";

  $: playlist = $playlists.find((x) => x.id === +$hash);
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

<Stack p gap grow>
  <Header xl>{title}</Header>
  <Stack x gap="lg">
    <Text secondary><Icon name="note" sm /> {tracks.length}</Text>
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
