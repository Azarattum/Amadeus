<script lang="ts">
  import Collection from "$lib/ui/Collection.svelte";
  import { streams, expand } from "$lib/trpc";
  import { Icon } from "@amadeus-music/ui";
  import { stream } from "$lib/stream";
  import { page } from "$app/stores";

  export let title = "";

  const estimate = ~~((globalThis.innerHeight / 56) * 2);

  $: remote = stream(expand.artist, streams.next);
  $: remote.update({ id: +$page.url.hash.slice(1), page: estimate });
  $: title = $remote?.detail?.title || "";
</script>

<Collection
  of={$remote?.detail}
  tracks={$remote}
  style="artist"
  on:end={() => remote.next()}
>
  <Icon of="last" slot="action" />
</Collection>

<svelte:head>
  <title>{$remote?.detail ? `${$remote.detail.title} - ` : ""}Amadeus</title>
</svelte:head>
