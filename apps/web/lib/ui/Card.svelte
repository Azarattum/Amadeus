<script lang="ts">
  import type { Album, Artist, Playlist } from "@amadeus-music/protocol";
  import { Card, Header, Stack, Text, Icon } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/string";
  import Avatar from "./Avatar.svelte";

  export let playlist: Playlist | undefined | true = undefined;
  export let artist: Artist | undefined | true = undefined;
  export let album: Album | undefined | true = undefined;

  export let href: string | undefined = undefined;

  const ok = (x: any): x is object => typeof x === "object";
  $: item = playlist || artist || album;
  $: loading = item === true;

  $: title = ok(item) ? item.title : "Loading...";
  $: art = ok(item) ? item : undefined;
</script>

<Card interactive={!!href && !loading} {href}>
  <Header center {loading}>{title}</Header>
  {#if album && ok(item) && "artists" in item}
    <Text secondary {loading}>
      {item.artists.map((x) => x.title).join(", ")}
    </Text>
  {:else if ok(item) && item.collection}
    <Stack justify x gap="lg">
      <Text secondary {loading}>
        <Icon name="note" sm />
        {item.collection.size}
      </Text>
      <Text secondary {loading}>
        <Icon name="clock" sm />
        {format(item.collection.duration)}
      </Text>
    </Stack>
  {:else if !artist}
    <Text secondary {loading}>Loading...</Text>
  {/if}
  <Avatar round={!!artist} of={art} slot="after" />
</Card>
