<script lang="ts">
  import Collection from "$lib/ui/Collection.svelte";
  import { expand, streams } from "$lib/trpc";
  import { Icon } from "@amadeus-music/ui";
  import { stream } from "$lib/stream";
  import { page } from "$app/stores";
  import { extra } from "$lib/data";

  const estimate = ~~((globalThis.innerHeight / 56) * 2.5);

  $: remote = stream(expand.album, streams.next);
  $: remote.update({ id: +$page.url.hash.slice(1), page: estimate });
  $: $extra = $remote?.detail ? [$remote.detail.title, "disk"] : null;
</script>

<Collection
  style="album"
  tracks={$remote}
  of={$remote?.detail}
  on:end={() => remote.next()}
>
  <Icon name="last" slot="action" />
</Collection>

<svelte:head>
  <title>{$remote?.detail ? `${$remote.detail.title} - ` : ""}Amadeus</title>
</svelte:head>
