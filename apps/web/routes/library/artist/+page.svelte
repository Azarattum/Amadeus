<script lang="ts">
  import { artists, artist, target } from "$lib/data";
  import Artist from "$lib/ui/Artist.svelte";
  import { Icon } from "@amadeus-music/ui";
  import { page } from "$app/stores";
  import { onDestroy } from "svelte";

  $: $target = +$page.url.hash.slice(1) || 0;
  $: info = $artist[0] ? $artist[0] : $artists.find(({ id }) => id === $target);

  onDestroy(() => artist.set([]));
</script>

<Artist {info}>
  <Icon name="last" slot="action" />
</Artist>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
