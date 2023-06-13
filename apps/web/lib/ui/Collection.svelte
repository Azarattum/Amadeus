<script lang="ts">
  import type {
    CollectionType,
    Collection,
    Track,
  } from "@amadeus-music/protocol";
  import { Icon, Stack, Header, Text, Topbar, Spacer } from "@amadeus-music/ui";
  import { capitalize, format } from "@amadeus-music/util/string";
  import Tracks from "$lib/ui/Tracks.svelte";
  import Avatar from "./Avatar.svelte";
  import { search } from "$lib/data";
  import { match } from "$lib/util";

  export let fixed = false;
  export let style: CollectionType;
  export let selected = new Set<Track>();
  export let of: Collection | undefined = undefined;
  export let tracks: Track[] | undefined = undefined;

  const unique = <T>(x: T[]) => [...new Set(x)];

  $: filtered = (tracks || of?.collection?.tracks)?.filter(match($search));
  $: href =
    of?.collection && style !== "playlist"
      ? `/explore/${style}#${of?.id}`
      : undefined;
  $: details = of
    ? unique(
        "artists" in of
          ? of.artists.map((x) => x.title)
          : "sources" in of
          ? of?.sources
              .map((x: string) => capitalize(x.split("/")[0]))
              .filter((x): x is string => !!x)
          : []
      ).join(", ")
    : "Loading";
</script>

<Stack gap={style === "playlist" ? "lg" : undefined} grow>
  <Topbar title={of?.title || ""}>
    <Stack gap="lg" x center p={style !== "playlist"}>
      {#if style !== "playlist"}
        <Avatar {href} round={style === "artist"} {of} />
      {/if}
      <Stack gap>
        <Header
          xl={style === "playlist"}
          indent={style === "playlist"}
          loading={!of}>{of?.title}</Header
        >
        <Stack x gap="lg">
          {#if of?.collection}
            <Text secondary indent={style === "playlist"}>
              <Icon name="note" sm />
              {of.collection.size}
            </Text>
            <Text secondary indent={style === "playlist"}>
              <Icon name="clock" sm />
              {format(of.collection.duration)}
            </Text>
            {#if "remote" in of && of.remote}
              <Spacer />
              <Text secondary><Icon name="share" sm /> {of.remote}</Text>
            {/if}
          {:else}
            <Text secondary loading={!of} indent={style === "playlist"}>
              {#if style === "artist"}
                <Icon name="globe" sm />
              {/if}
              {details}
            </Text>
          {/if}
        </Stack>
      </Stack>
    </Stack>
  </Topbar>
  <!-- /// TODO: albums -->

  <Tracks
    fixed={fixed || (style === "playlist" ? !!$search : true)}
    tracks={filtered}
    on:edit
    on:click
    on:action
    on:end
    bind:selected
  >
    <slot name="action" slot="action" />
    <slot />
  </Tracks>
</Stack>
