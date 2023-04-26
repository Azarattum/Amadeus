<script lang="ts">
  import { Icon, Stack, Header, Image, Text } from "@amadeus-music/ui";
  import { hash } from "@amadeus-music/ui/internal/page";
  import Tracks from "$lib/components/Tracks.svelte";
  import { artists, playlists } from "$lib/data";

  /// TODO: this is bad! should be reworked on the data level!
  $: artist = $artists.find((x) => x.id === +$hash);
  $: name = artist?.title || "Loading";
  $: tracks = $playlists
    .flatMap((x) => x.tracks)
    .filter((y) => y.artists.find((z) => z.id === artist?.id));
</script>

<Stack gap="lg" x center p>
  <div class="overflow-hidden rounded-full">
    <Image src={artist?.art || ""} size={104} />
  </div>
  <Stack gap>
    <Header xl>{name}</Header>
    <Stack x gap="lg">
      <Text secondary><Icon name="note" sm /> {tracks.length}</Text>
      <Text secondary><Icon name="clock" sm /> TODO</Text>
    </Stack>
  </Stack>
</Stack>
<!-- TODO: albums -->

<Tracks {tracks}>
  <Icon name="last" slot="action" />
</Tracks>
