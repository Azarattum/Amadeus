<script lang="ts">
  import { Header, Icon, Stack, Text, Topbar, Spacer } from "@amadeus-music/ui";
  import type { PlaylistInfo, TrackDetails } from "@amadeus-music/protocol";
  import { format } from "@amadeus-music/util/string";
  import Tracks from "./Tracks.svelte";

  export let selected = new Set<(typeof tracks)[number]>();
  export let info: PlaylistInfo | undefined = undefined;
  export let tracks: (TrackDetails & { entry: number })[] = [];
  $: time = format(tracks.reduce((a, b) => a + b.length, 0));
</script>

<Stack gap="lg" grow>
  <Stack gap>
    <Topbar title={info?.title}>
      <Header xl indent loading={!info}>{info?.title}</Header>
    </Topbar>
    <Stack x gap="lg">
      <Text indent secondary loading={!tracks.length}>
        <Icon name="note" sm />
        {tracks.length}
      </Text>
      <Text secondary loading={!time}>
        <Icon name="clock" sm />
        {time}
      </Text>
      <Spacer />
      {#if info?.remote}
        <Text secondary><Icon name="share" sm /> {info.remote}</Text>
      {/if}
    </Stack>
  </Stack>

  <Tracks {tracks} on:edit on:click on:action bind:selected>
    <slot name="action" slot="action" />
    <slot />
  </Tracks>
</Stack>
