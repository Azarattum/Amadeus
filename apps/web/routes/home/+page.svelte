<script lang="ts">
  import { Header, Icon, Stack, Topbar, Button, When } from "@amadeus-music/ui";
  import { feed, playback, search } from "$lib/data";
  import Overview from "$lib/ui/Overview.svelte";
  import Track from "$lib/ui/Track.svelte";
  import { onMount } from "svelte";

  const hidden = new Set([-3, -4]);

  $: devices = $playback.filter((x) => !x.local);

  onMount(() => {
    if (!location.hash) location.replace("#feed");
  });
</script>

<Topbar title="Home">
  <Header xl indent id="feed">
    Home
    <When not sm slot="after">
      <Button round href="/settings"><Icon name="settings" /></Button>
    </When>
  </Header>
</Topbar>
<Stack p grow gap="lg">
  {#if devices.length}
    <Stack grow gap="sm">
      <Header sm>Other Devices</Header>
      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,40rem),1fr))] gap-1"
      >
        {#each devices as { device, track, progress }}
          <div
            class="dark:ring-none rounded-lg shadow-sm ring-1 ring-highlight [&>*]:bg-surface-100"
          >
            <Track
              sm
              {track}
              {progress}
              on:click={() => playback.replicate(device)}
            >
              <Button
                air
                on:click={(e) => (playback.clear(device), e.stopPropagation())}
              >
                <Icon name="close" />
              </Button>
            </Track>
          </div>
        {/each}
      </div>
    </Stack>
  {/if}

  <Stack grow gap="sm">
    <Header sm>You Might Like</Header>
    <Overview
      style="playlist"
      filter={$search}
      of={$feed.filter((x) => !hidden.has(x.id))}
      href="/home"
    />
  </Stack>

  <!-- <Header id="following" sm>New for You</Header> -->
  <!-- /// TODO add artists cards -->
</Stack>

<svelte:head>
  <title>Amadeus</title>
</svelte:head>
