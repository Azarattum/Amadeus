<script lang="ts">
  import {
    type Classes,
    Header,
    Stack,
    Morph,
    Words,
    Card,
    Text,
    Icon,
  } from "@amadeus-music/ui";
  import type { Playlist, Artist, Album } from "@amadeus-music/protocol";
  import type { Either } from "@amadeus-music/ui/internal/types";
  import { gather, which, ok } from "$lib/util/props";
  import { nully } from "@amadeus-music/util/string";
  import { format } from "@amadeus-music/util/time";
  import Cover from "../Cover.svelte";

  type $$Props = Either<{
    playlist: Playlist | true;
    artist: Artist | true;
    album: Album | true;
  }> & { class?: Classes; href?: string };

  let classes: Classes = "";
  export { classes as class };
  export let playlist: Playlist | true | undefined = undefined;
  export let artist: Artist | true | undefined = undefined;
  export let album: Album | true | undefined = undefined;
  export let href: string | undefined = undefined;

  $: [type, media] = which({ playlist, artist, album });
  $: title = media?.title || "Loading...";
  $: loading = !media;
  $: id = media?.id;
</script>

<Morph marker key={nully`${type}-${id}`}>
  <Card big disabled={loading || !href} class={classes} {href}>
    <Cover
      md
      {...gather({ playlist, artist, album })}
      marker
      morph={nully`thumb-${type}-${id}`}
      slot="before"
    />
    <Morph marker key={nully`heading-${type}-${id}`}>
      <Header center {loading}>
        <Morph marker key={nully`title-${type}-${id}`}>
          <Words from={title} />
        </Morph>
      </Header>
    </Morph>
    <Morph marker key={nully`meta-${type}-${id}`}>
      {#if media && "artists" in media}
        <Text secondary {loading}>
          {media.artists.map((x) => x.title).join(", ")}
        </Text>
      {:else if ok(media) && media?.collection}
        <Stack x class="justify-center gap-4">
          <Text secondary {loading}>
            <Icon of="note" sm />
            {media.collection.size}
          </Text>
          <Text secondary {loading}>
            <Icon of="clock" sm />
            {format(media.collection.duration)}
          </Text>
        </Stack>
      {:else if !artist}
        <Text secondary {loading}>Loading...</Text>
      {/if}
    </Morph>
  </Card>
</Morph>
