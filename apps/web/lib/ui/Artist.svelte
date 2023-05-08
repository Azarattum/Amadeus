<script lang="ts">
  import type { ArtistCollection, TrackEntry } from "@amadeus-music/protocol";
  import { Icon, Stack, Header, Text, Topbar } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/string";
  import Tracks from "$lib/ui/Tracks.svelte";
  import Avatar from "./Avatar.svelte";

  export let selected = new Set<TrackEntry>();
  export let info: ArtistCollection | undefined = undefined;
</script>

<Topbar title={info?.title || ""}>
  <Stack gap="lg" x center p>
    <Avatar round of={info} />
    <Stack gap>
      <Header loading={!info}>{info?.title}</Header>
      <Stack x gap="lg">
        <Text secondary loading={!info}>
          <Icon name="note" sm />
          {info?.count}
        </Text>
        <Text secondary loading={!info}>
          <Icon name="clock" sm />
          {format(info?.length || 0)}
        </Text>
      </Stack>
    </Stack>
  </Stack>
</Topbar>
<!-- /// TODO: albums -->

<Tracks fixed tracks={info?.tracks} on:edit on:click on:action bind:selected>
  <slot name="action" slot="action" />
  <slot />
</Tracks>
