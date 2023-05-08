<script lang="ts">
  import type { PlaylistCollection, TrackEntry } from "@amadeus-music/protocol";
  import { Header, Icon, Stack, Text, Topbar, Spacer } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/string";
  import Tracks from "./Tracks.svelte";
  import { search } from "$lib/data";
  import { match } from "$lib/util";

  export let selected = new Set<TrackEntry>();
  export let info: PlaylistCollection | undefined = undefined;

  $: tracks = info?.tracks.filter(match($search));
</script>

<Stack gap="lg" grow>
  <Stack gap>
    <Topbar title={info?.title}>
      <Header xl indent loading={!info}>{info?.title}</Header>
    </Topbar>
    <Stack x gap="lg">
      <Text indent secondary loading={!info}>
        <Icon name="note" sm />
        {info?.count}
      </Text>
      <Text secondary loading={!info}>
        <Icon name="clock" sm />
        {format(info?.length || 0)}
      </Text>
      <Spacer />
      {#if info?.remote}
        <Text secondary><Icon name="share" sm /> {info.remote}</Text>
      {/if}
    </Stack>
  </Stack>

  <Tracks fixed={!!$search} {tracks} on:edit on:click on:action bind:selected>
    <slot name="action" slot="action" />
    <slot />
  </Tracks>
</Stack>
