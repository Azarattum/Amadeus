<script context="module" lang="ts">
  let played = false;
  export function play() {
    played = true;
  }
</script>

<script lang="ts">
  import { Button, Header, Icon, Portal, Separator } from "@amadeus-music/ui";
  import { throttle } from "@amadeus-music/util/async";
  import type { Track } from "@amadeus-music/protocol";
  import Playback from "$lib/ui/Playback.svelte";
  import { upcoming, playback } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { desource } from "$lib/trpc";
  import { tick } from "svelte";

  const sync = throttle(async () => {
    if (!track) return;
    const progress = currentTime / track.duration;
    if (progress < 1) playback.sync(progress);
  }, 3000);

  let track: Track | undefined = undefined;
  let playbackRate = 1;
  let currentTime = 0;
  let readyState = 0;
  let paused = true;
  let src = "";

  $: load($playback.find((x) => x.local)?.track);
  $: currentTime, sync();

  let selected = new Set<Track>();

  async function load(target?: Track) {
    if (target?.id === track?.id) return;
    track = target;
    if (!track) return;
    readyState = 0;
    const url = await desource.query(track);
    if (url === src) return;
    src = url;
    if (played) {
      played = false;
      paused = true;
      await tick();
      paused = false;
    }
  }

  function purge() {
    playback.purge(
      [...selected].map((x) => x.entry).filter((x): x is number => !!x)
    );
    selected.clear();
    selected = selected;
  }

  async function skip(to?: Track) {
    if (to?.entry) playback.rearrange(to.entry, track?.entry);
    await playback.sync(1);
    play();
  }
</script>

<audio
  {src}
  preload="auto"
  bind:paused
  bind:readyState
  bind:currentTime
  bind:playbackRate
  on:ended={() => playback.sync(1)}
/>
<Portal to="right">
  <div class="flex h-screen flex-col border-l border-highlight">
    <div>
      <Playback
        {track}
        loading={readyState <= 2 && !!src}
        on:forward={() => (playbackRate = 5)}
        on:rewind={() => (playbackRate = -5)}
        on:reset={() => (playbackRate = 1)}
        bind:currentTime
        bind:paused
      />
      <Header indent sm>Playing Next</Header>
      <Separator />
    </div>
    <div class="grow overflow-y-scroll contain-strict">
      <Tracks
        tracks={$upcoming}
        sm
        bind:selected
        on:click={(e) => (e.preventDefault(), skip(e.detail))}
      >
        <Button air stretch on:click={purge}><Icon name="trash" /></Button>
      </Tracks>
    </div>
  </div>
</Portal>
