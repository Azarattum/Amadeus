<script lang="ts">
  import Artist from "$lib/ui/Artist.svelte";
  import { Icon } from "@amadeus-music/ui";
  import { artists } from "$lib/data";
  import { page } from "$app/stores";

  $: info = $artists.find((x) => x.id === +$page.url.hash.slice(1));
</script>

<Artist {info}>
  <Icon name="last" slot="action" />
</Artist>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
