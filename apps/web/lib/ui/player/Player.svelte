<script context="module" lang="ts">
  let played = false;
  export function play() {
    played = true;
  }
</script>

<script lang="ts">
  import {
    type Classes,
    Separator,
    Tooltip,
    Button,
    Header,
    Icon,
    tw,
  } from "@amadeus-music/ui";
  import { throttle } from "@amadeus-music/util/async";
  import type { Track } from "@amadeus-music/protocol";
  import { upcoming, playback } from "$lib/data";
  import Playback from "./Playback.svelte";
  import { desource } from "$lib/trpc";
  import { tick } from "svelte";
  import { Tracks } from "..";

  const sync = throttle(async () => {
    if (!track) return;
    const progress = currentTime / track.duration;
    if (progress < 1) playback.sync(progress);
  }, 3000);

  let classes: Classes = "";
  export { classes as class };

  let track: Track | undefined = undefined;
  let playbackRate = 1;
  let currentTime = 0;
  let readyState = 0;
  let paused = true;
  let ended = false;
  let src = "";

  $: state = $playback.find((x) => x.local);
  $: load(state?.track);
  $: currentTime, sync(), (ended = false);
  $: if (state && track && !currentTime) {
    currentTime = state.progress * track.duration;
  }

  async function load(target?: Track) {
    if (target?.id === track?.id) return;
    track = target;
    if (!track) return (paused = true), (currentTime = 0);
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

  async function skip(to?: Track) {
    if (to?.entry) playback.rearrange(to.entry, track?.entry);
    if (state?.repeat === 1) {
      playback.repeat("none");
      playback.sync(1);
      await playback.repeat("single");
    } else await playback.sync(1);
    play();
  }
</script>

<audio
  preload="auto"
  {src}
  on:ended={() => ended || (playback.sync(1), (ended = true))}
  bind:playbackRate
  bind:currentTime
  bind:readyState
  bind:paused
/>
<div class={tw`flex h-screen flex-col border-l border-highlight ${classes}`}>
  <div>
    <Playback
      loading={readyState <= 2 && !!src}
      {track}
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
      editable
      sm
      tracks={$upcoming}
      on:click={(e) => (e.preventDefault(), skip(e.detail))}
      let:selected
    >
      <Button air on:click={() => playback.purge(selected.map((x) => x.entry))}>
        <Icon of="trash" /><Tooltip>Remove from Queue</Tooltip>
      </Button>
    </Tracks>
  </div>
</div>
