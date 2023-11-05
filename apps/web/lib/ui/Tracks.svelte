<script lang="ts">
  import {
    Swipeable,
    Separator,
    Virtual,
    Header,
    Portal,
    Button,
    When,
    Icon,
    Panel,
    Stack,
    type EditEvent,
  } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { compare } from "@amadeus-music/util/time";
  import { play as resume } from "./Player.svelte";
  import { createEventDispatcher } from "svelte";
  import TrackUI from "./Track.svelte";
  import { playback } from "$lib/data";

  const dispatch = createEventDispatcher<{
    edit: EditEvent<Track>["detail"];
    action: Track;
    click: Track;
  }>();

  export let sm = false;
  export let fixed = false;
  export let timeline = false;
  export let selected = new Set<Track>();
  export let tracks: (Track | undefined)[] | undefined = undefined;

  const prerender = 10;
  $: items = process(tracks);
  $: if (!tracks?.length) clear();

  function process(items: typeof tracks) {
    if (!items) return Array.from<undefined>({ length: prerender });
    if (!timeline) return items;
    const timed: (Track | string | undefined)[] = [];
    let lastLabel = "";

    for (const item of items) {
      if (!item || !("date" in item) || typeof item.date !== "number") continue;
      const date = new Date(item.date * 1000);
      const label = compare(date);
      if (label !== lastLabel) timed.push(label), (lastLabel = label);
      timed.push(item);
    }

    return timed;
  }

  function select(track: Track) {
    if (selected.has(track)) selected.delete(track);
    else selected.add(track);
    selected = selected;
  }

  function check(track: Track, selection: Set<Track>) {
    if (!selection.size) return false;
    if (selection.has(track)) return true;
    return "passive";
  }

  function clear() {
    selected.clear();
    selected = selected;
  }

  async function play(track: Track) {
    if (!dispatch("click", track, { cancelable: true })) return;
    const id = tracks?.indexOf(track);
    if (!tracks || !tracks[0] || id == null || id === -1) return;
    playback.clear();
    playback.push(tracks.slice(id) as any);
    await playback.push(tracks.slice(0, id) as any, "first");
    resume();
  }
</script>

<div>
  {#if !sm}
    <When lg>
      <div
        class="sticky top-11 z-10 grid auto-cols-fr grid-flow-col border-b border-b-highlight bg-surface/70 pl-20 pr-10 backdrop-blur-md"
        class:pl-24={timeline}
      >
        <Header sm>Title</Header>
        <Header sm>Artist</Header>
        <Header sm>Album</Header>
      </div>
    </When>
  {/if}
  <Virtual
    key={(x) => (typeof x === "string" ? x : x?.entry || x?.id)}
    sortable="tracks"
    let:item={track}
    let:index
    {prerender}
    {fixed}
    {items}
    animate
    on:edit
    on:end
  >
    <div
      class="relative flex [&_hr]:!opacity-100 [*:has(>&):last-of-type_hr]:!opacity-0"
    >
      {#if timeline}
        <div
          class="visible ml-4 flex h-14 w-0.5 items-center justify-center bg-highlight-100"
          class:opacity-0={Number.isNaN(index)}
        >
          {#if typeof track === "string"}
            <div class="absolute mt-4 h-2 w-2 rounded-full bg-content" />
          {/if}
        </div>
      {/if}
      {#if typeof track === "string"}
        <h2
          draggable="false"
          class="relative top-2 flex h-14 items-center indent-4 text-lg [*:has(>div>&)]:pointer-events-none"
        >
          {track}
        </h2>
      {:else if track}
        {#if $$slots.default || $$slots.action}
          <Swipeable
            on:before={() => dispatch("action", track)}
            on:after={() => select(track)}
          >
            <slot name="action" slot="before" />
            <TrackUI
              {sm}
              {track}
              selected={check(track, selected)}
              on:click={() => (selected.size ? select(track) : play(track))}
              on:contextmenu={(e) => (e.preventDefault(), select(track))}
            />
            <Icon name="list" slot="after" />
          </Swipeable>
        {:else}
          <TrackUI
            {sm}
            {track}
            selected={check(track, selected)}
            on:click={() => play(track)}
          />
        {/if}
      {:else}
        <TrackUI {sm} />
      {/if}
    </div>
  </Virtual>
</div>

{#if $$slots.default || $$slots.action}
  <Portal to="bottom">
    {#if selected.size}
      <Panel>
        <Stack x>
          <slot />
          <Separator />
          <Button air square on:click={clear}><Icon name="close" /></Button>
        </Stack>
      </Panel>
    {/if}
  </Portal>
{/if}
