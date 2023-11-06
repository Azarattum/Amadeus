<script lang="ts">
  import type { Playlist, Artist, Album } from "@amadeus-music/protocol";
  import { Header, Stack, Card, Text, Icon } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/time";
  import Avatar from "./Avatar.svelte";

  export let playlist: Playlist | true | undefined = undefined;
  export let artist: Artist | true | undefined = undefined;
  export let album: Album | true | undefined = undefined;

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
  <Avatar of={art} round={!!artist} slot="after" />
</Card>
