<script lang="ts">
  import {
    Projection,
    Header,
    Topbar,
    Button,
    Stack,
    Icon,
    When,
  } from "@amadeus-music/ui";
  import { feed, playback, search } from "$lib/data";
  import Overview from "$lib/ui/Overview.svelte";
  import Playlist from "./playlist/-page.svelte";
  import Track from "$lib/ui/Track.svelte";
  import { navigating } from "$app/stores";
  import { goto } from "$app/navigation";

  const hidden = new Set([-3, -4]);

  export let visible = true;

  $: devices = $playback.filter((x) => !x.local);
  $: if (visible && !$navigating && globalThis.location && !location?.hash) {
    goto("#feed", { replaceState: true });
  }
</script>

<Topbar title="Home">
  <Header xl indent id="feed">
    Home
    <When not sm slot="after">
      <Button round href="/settings"><Icon name="settings" /></Button>
    </When>
  </Header>
</Topbar>
<Stack class="gap-4 p-4">
  {#if devices.length}
    <Stack class="gap-1">
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

  <Stack class="gap-1">
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

<Projection at="playlist" class="bg-surface" ephemeral>
  <Playlist />
</Projection>

<svelte:head>
  <title>Amadeus</title>
</svelte:head>
