<script lang="ts">
  import {
    type Classes,
    Header,
    Stack,
    Card,
    Text,
    Icon,
    tw,
  } from "@amadeus-music/ui";
  import type { Playlist, Artist, Album } from "@amadeus-music/protocol";
  import { format } from "@amadeus-music/util/time";
  import Avatar from "./Avatar.svelte";

  let classes: Classes = "";
  export { classes as class };
  export let playlist: Playlist | true | undefined = undefined;
  export let artist: Artist | true | undefined = undefined;
  export let album: Album | true | undefined = undefined;

  export let id = "";
  export let href: string | undefined = undefined;

  const ok = (x: any): x is object => typeof x === "object";
  $: type = playlist ? "playlist" : artist ? "artist" : "album";
  $: item = playlist || artist || album;
  $: loading = item === true;

  $: title = ok(item) ? item.title : "Loading...";
  $: art = ok(item) ? item : undefined;
</script>

<Card
  class={tw`${id && ok(item) && `${type}-${id}`} ${classes}`}
  interactive={!!href && !loading}
  {href}
>
  <Header center class={id && ok(item) && `title-${type}-${id}`} {loading}
    >{title}</Header
  >
  {#if album && ok(item) && "artists" in item}
    <Text secondary {loading}>
      {item.artists.map((x) => x.title).join(", ")}
    </Text>
  {:else if ok(item) && item.collection}
    <Stack
      x
      class={tw`justify-center gap-4 ${id && ok(item) && `meta-${type}-${id}`}`}
    >
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
  <Avatar
    of={art}
    id={id && ok(item) && `${type}-${id}`}
    round={!!artist}
    slot="after"
  />
</Card>
