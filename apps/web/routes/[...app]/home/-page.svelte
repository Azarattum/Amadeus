<script lang="ts">
  import {
    Projection,
    Header,
    Topbar,
    Button,
    Portal,
    Stack,
    Icon,
    When,
  } from "@amadeus-music/ui";
  import { playback, search, feed } from "$lib/data";
  import Overview from "$lib/ui/Overview.svelte";
  import Playlist from "./playlist/-page.svelte";
  import Track from "$lib/ui/Track.svelte";
  import { navigating } from "$app/stores";
  import { goto } from "$app/navigation";

  export let visible = true;
  export let active = true;
  export let hash = "";
  export let page = "";

  const aliases = { "-2": "recommended", "-1": "listened" };

  $: devices = $playback.filter((x) => !x.local);
  $: if (visible && !$navigating && globalThis.location && !location?.hash) {
    goto("#feed", { replaceState: true });
  }
</script>

<Topbar title="Home">
  <Header indent xl id="feed">
    Home
    <When not sm slot="after">
      <Button round href="/settings"><Icon of="settings" /></Button>
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
        {#each devices as { progress, device, track }}
          <div
            class="dark:ring-none rounded-lg shadow-sm ring-1 ring-highlight [&>*]:bg-surface-100"
          >
            <Track
              sm
              {progress}
              {track}
              on:click={() => playback.replicate(device)}
            >
              <Button
                air
                on:click={(e) => (playback.clear(device), e.stopPropagation())}
              >
                <Icon of="close" />
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
      of={$feed.length
        ? $feed.filter((x) => x.id in aliases)
        : [undefined, undefined]}
      style="playlist"
      filter={$search}
      href="/home"
      {aliases}
    />
  </Stack>

  <Header sm id="following">
    <!-- New for You -->
    <!-- /// TODO add artists cards -->
  </Header>
</Stack>

<Projection at="listened" ephemeral class="bg-surface">
  <Playlist id={-1} />
</Projection>
<Projection at="recommended" ephemeral class="bg-surface">
  <Playlist id={-2} />
</Projection>

{#if active}
  <Portal to="sections">
    <Header sm>Home</Header>
    <Button air primary={hash === "feed"} href="/home#feed">
      <Icon of="activity" />Feed
    </Button>
    <Button air primary={hash === "following"} href="/home#following">
      <Icon of="people" />Following
    </Button>
    <Button air primary={page.endsWith("listened")} href="/home/listened">
      <Icon of="history" />Listened
    </Button>
    <Button air primary={page.endsWith("recommended")} href="/home/recommended">
      <Icon of="stars" />Recommended
    </Button>
  </Portal>
{/if}

<svelte:head>
  <title>Amadeus</title>
</svelte:head>
