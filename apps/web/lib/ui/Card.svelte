<script lang="ts">
  import { Card, Header, Stack, Text, Icon } from "@amadeus-music/ui";
  import { format } from "@amadeus-music/util/string";
  import Avatar from "./Avatar.svelte";

  type Info = {
    album?: { art: string };
    tracks: any[] | number;
    length: number;
    title: string;
    art?: string;
  };
  export let playlist: Info | undefined | true = undefined;
  export let artist: Info | undefined | true = undefined;
  export let album: Info | undefined | true = undefined;

  export let href: string | undefined = undefined;

  const ok = (x: any): x is object => typeof x === "object";
  $: item = (playlist || artist || album) as Info | true;
  $: loading = item === true;

  $: title = ok(item) ? item.title : "Loading...";
  $: length = ok(item) ? item.length : 0;
  $: tracks = ok(item)
    ? Array.isArray(item.tracks)
      ? item.tracks.length
      : item.tracks
    : 0;
  $: art = ok(item)
    ? Array.isArray(item.tracks)
      ? item.tracks
      : item
    : undefined;
</script>

<Card interactive={!!href && !loading} {href}>
  <Header center {loading}>{title}</Header>
  <Stack justify x gap="lg">
    <Text secondary {loading}><Icon name="note" sm /> {tracks}</Text>
    <Text secondary {loading}><Icon name="clock" sm /> {format(length)}</Text>
  </Stack>
  <Avatar round={!!artist} of={art} slot="after" />
</Card>
