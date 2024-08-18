<script lang="ts">
  import {
    Projection,
    Header,
    Topbar,
    Button,
    Portal,
    Stack,
    Frame,
    Icon,
  } from "@amadeus-music/ui";
  import { playback, search, feed } from "$lib/data";
  import { navigating } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Media } from "$lib/ui";

  export let visible = true;
  export let active = true;
  export let hash = "";
  export let page = "";

  const aliases = { "-2": "recommended", "-1": "listened" };

  $: devices = $playback.filter((x) => !x.local);
  $: if (visible && !$navigating && globalThis.location && !location?.hash) {
    goto("#feed", { replaceState: true });
  }

  /* === Collection data === */
  let id = 0;

  $: id = active
    ? page.endsWith("/recommended")
      ? -2
      : page.endsWith("/listened")
        ? -1
        : id
    : id;
  $: playlist = $feed.find((x) => x.id === id) ?? true;
</script>

<Frame>
  <Topbar title="Home">
    <Header indent xl id="feed">
      Home
      <Button round class="sm:hidden" href="/settings" slot="after">
        <Icon of="settings" />
      </Button>
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
            <Media.Track
              sm
              class="dark:ring-none overflow-hidden rounded-lg bg-surface-100 shadow-sm ring-1 ring-highlight hover:bg-surface-highlight-100 [&>hr]:opacity-0"
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
            </Media.Track>
          {/each}
        </div>
      </Stack>
    {/if}

    <Stack class="gap-1">
      <Header sm>You Might Like</Header>
      <Media.Overview
        playlists={$feed.length
          ? $feed.filter((x) => x.id in aliases)
          : [undefined, undefined]}
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
</Frame>

<Projection at="listened" ephemeral title="Listened - Amadeus">
  <Frame morph="playlist--1">
    <Media.Collection filter={$search} {playlist} />
  </Frame>
</Projection>
<Projection at="recommended" ephemeral title="Recommended - Amadeus">
  <Frame morph="playlist--2">
    <Media.Collection filter={$search} {playlist} />
  </Frame>
</Projection>

{#if active}
  <Portal to="navigation">
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
