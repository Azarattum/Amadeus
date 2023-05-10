<script lang="ts">
  import Artist from "$lib/ui/Artist.svelte";
  import { artists, extra } from "$lib/data";
  import { Icon } from "@amadeus-music/ui";
  import { page } from "$app/stores";

  $: info = $artists.find((x) => x.id === +$page.url.hash.slice(1));
  $: $extra = info ? [info.title, "person"] : null;
</script>

<Artist {info}>
  <Icon name="last" slot="action" />
</Artist>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
