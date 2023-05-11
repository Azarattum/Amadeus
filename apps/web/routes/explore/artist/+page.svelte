<script lang="ts">
  import { expand, streams } from "$lib/trpc";
  import Artist from "$lib/ui/Artist.svelte";
  import { Icon } from "@amadeus-music/ui";
  import { stream } from "$lib/stream";
  import { page } from "$app/stores";
  import { extra } from "$lib/data";

  const estimate = ~~((globalThis.innerHeight / 56) * 2.5);

  $: remote = stream(expand.artist, streams.next);
  $: remote.update({ id: +$page.url.hash.slice(1), page: estimate });
  $: $extra = $remote?.detail ? [$remote.detail.title, "person"] : null;
</script>

<Artist info={$remote?.detail} tracks={$remote} on:end={() => remote.next()}>
  <Icon name="last" slot="action" />
</Artist>

<svelte:head>
  <title>{$remote?.detail ? `${$remote.detail.title} - ` : ""}Amadeus</title>
</svelte:head>
