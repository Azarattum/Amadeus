<script lang="ts">
  import {
    type Classes,
    Header,
    Stack,
    Morph,
    Words,
    Image,
    Card,
    Text,
    Icon,
  } from "@amadeus-music/ui";
  import type { Playlist, Artist, Album } from "@amadeus-music/protocol";
  import FallbackCover from "./FallbackCover.svelte";
  import { format } from "@amadeus-music/util/time";
  import ImageGrid from "./ImageGrid.svelte";

  let classes: Classes = "";
  export { classes as class };
  export let playlist: Playlist | true | undefined = undefined;
  export let artist: Artist | true | undefined = undefined;
  export let album: Album | true | undefined = undefined;

  export let href: string | undefined = undefined;

  const ok = (x: any): x is object => typeof x === "object";
  $: type = playlist
    ? ("playlist" as const)
    : artist
      ? ("artist" as const)
      : ("album" as const);
  $: item = playlist || artist || album;
  $: loading = item === true;

  $: title = ok(item) ? item.title : "Loading...";
  $: id = ok(item) ? item.id : undefined;
  $: art = ok(item) ? item : undefined;
</script>

<Morph marker key={`${type}-${id}`}>
  <Card big disabled={loading || !href} class={classes} {href}>
    <Morph marker key="thumb-{type}-{id}" slot="before">
      <ImageGrid
        class={type === "artist" ? "rounded-full" : "rounded-2xl"}
        let:rounded
        let:size
      >
        {#if !art || (art && "arts" in art)}
          <Image
            thumbnail={art && (art.thumbnails?.[0] || "")}
            src={art && (art.arts?.[0] || "")}
            {size}
          >
            {#if type !== "playlist"}
              <FallbackCover of={type} xl {id} />
            {/if}
          </Image>
        {:else if art}
          {#each art.collection?.tracks.slice(0, 4) || [] as { album, id }, i}
            <Morph marker key="thumb-{type}-{art.id}-{i}">
              <Image
                thumbnail={album?.thumbnails?.[0] || ""}
                src={album.arts?.[0] || ""}
                class={rounded[i]}
              >
                <FallbackCover of="track" {id} />
              </Image>
            </Morph>
          {/each}
        {/if}
      </ImageGrid>
    </Morph>
    <Morph marker key="heading-{type}-{id}">
      <Header center {loading}>
        <Morph marker key="title-{type}-{id}">
          <Words from={title} />
        </Morph>
      </Header>
    </Morph>
    <Morph marker key={`meta-${type}-${id}`}>
      {#if album && ok(item) && "artists" in item}
        <Text secondary {loading}>
          {item.artists.map((x) => x.title).join(", ")}
        </Text>
      {:else if ok(item) && item.collection}
        <Stack x class="justify-center gap-4">
          <Text secondary {loading}>
            <Icon of="note" sm />
            {item.collection.size}
          </Text>
          <Text secondary {loading}>
            <Icon of="clock" sm />
            {format(item.collection.duration)}
          </Text>
        </Stack>
      {:else if !artist}
        <Text secondary {loading}>Loading...</Text>
      {/if}
    </Morph>
  </Card>
</Morph>
