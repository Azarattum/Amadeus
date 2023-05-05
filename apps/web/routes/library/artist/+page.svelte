<script lang="ts">
  import { artists, playlists } from "$lib/data";
  import Artist from "$lib/ui/Artist.svelte";
  import { Icon } from "@amadeus-music/ui";
  import { page } from "$app/stores";

  /// TODO: this is bad! should be reworked on the data level!
  $: info = $artists.find((x) => x.id === +$page.url.hash.slice(1));
  $: tracks = $playlists
    .flatMap((x) => x.tracks)
    .filter((y) => y.artists.find((z) => z.id === info?.id));
</script>

<Artist {info} {tracks}>
  <Icon name="last" slot="action" />
</Artist>
