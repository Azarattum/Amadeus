<script lang="ts">
  import type { ArtistCollection, TrackDetails } from "@amadeus-music/protocol";
  import { Icon, Stack, Header, Text, Topbar } from "@amadeus-music/ui";
  import { capitalize, format } from "@amadeus-music/util/string";
  import Tracks from "$lib/ui/Tracks.svelte";
  import Avatar from "./Avatar.svelte";
  import { search } from "$lib/data";
  import { match } from "$lib/util";

  export let selected = new Set<TrackDetails>();
  export let info: Partial<ArtistCollection> | undefined = undefined;
  export let tracks = info?.tracks;

  $: href = info?.count != null ? `/explore/artist#${info?.id}` : undefined;
  $: filtered = tracks?.filter(match($search));
  $: sources = [
    ...new Set<string>(
      JSON.parse(info?.source || "[]")
        .map((x: string) => capitalize(x.split("/")[0]))
        .filter((x: string) => x)
    ),
  ].join(", ");
</script>

<Topbar title={info?.title || ""}>
  <Stack gap="lg" x center p>
    <Avatar {href} round of={info} />
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
          <Text secondary><Icon name="globe" sm /> {sources}</Text>
        {/if}
      </Stack>
    </Stack>
  </Stack>
</Topbar>
<!-- /// TODO: albums -->

<Tracks fixed tracks={filtered} on:edit on:click on:action on:end bind:selected>
  <slot name="action" slot="action" />
  <slot />
</Tracks>
