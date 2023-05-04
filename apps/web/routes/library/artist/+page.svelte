<script lang="ts">
  import { Icon, Stack, Header, Image, Text, Topbar } from "@amadeus-music/ui";
  import { artists, playlists } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { page } from "$app/stores";

  /// TODO: this is bad! should be reworked on the data level!
  $: artist = $artists.find((x) => x.id === +$page.url.hash.slice(1));
  $: name = artist?.title || "Loading";
  $: tracks = $playlists
    .flatMap((x) => x.tracks)
    .filter((y) => y.artists.find((z) => z.id === artist?.id));
</script>

<Topbar title={name}>
  <Stack gap="lg" x center p>
    <div class="overflow-hidden rounded-full">
      <Image src={artist?.art || ""} size={104} />
    </div>
    <Stack gap>
      <Header>{name}</Header>
      <Stack x gap="lg">
        <Text secondary><Icon name="note" sm /> {tracks.length}</Text>
        <Text secondary><Icon name="clock" sm /> TODO</Text>
      </Stack>
    </Stack>
  </Stack>
</Topbar>
<!-- /// TODO: albums -->

<Tracks {tracks}>
  <Icon name="last" slot="action" />
</Tracks>
