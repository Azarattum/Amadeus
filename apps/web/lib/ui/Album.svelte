<script lang="ts">
  import type { AlbumCollection, TrackDetails } from "@amadeus-music/protocol";
  import { Icon, Stack, Header, Text, Topbar } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/string";
  import Tracks from "$lib/ui/Tracks.svelte";
  import Avatar from "./Avatar.svelte";
  import { search } from "$lib/data";
  import { match } from "$lib/util";

  export let selected = new Set<TrackDetails>();
  export let info: Partial<AlbumCollection> | undefined = undefined;
  export let tracks = info?.tracks;

  $: filtered = tracks?.filter(match($search));
  $: artists = info?.artists?.map((x) => x.title).join(", ");
</script>

<Topbar title={info?.title || ""}>
  <Stack gap="lg" x center p>
    <Avatar of={info} />
    <Stack gap>
      <Header loading={!info}>{info?.title}</Header>
      <Stack x gap="lg">
        {#if !info || (info.count != null && info.length != null)}
          <Text secondary loading={!info}>
            <Icon name="note" sm />
            {info?.count}
          </Text>
          <Text secondary loading={!info}>
            <Icon name="clock" sm />
            {format(info?.length || 0)}
          </Text>
        {:else}
          <Text secondary>{artists}</Text>
        {/if}
      </Stack>
    </Stack>
  </Stack>
</Topbar>

<Tracks fixed tracks={filtered} on:edit on:click on:action on:end bind:selected>
  <slot name="action" slot="action" />
  <slot />
</Tracks>
