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
  import { createEventDispatcher } from "svelte";
  import TrackUI from "./Track.svelte";

  const dispatch = createEventDispatcher<{
    edit: EditEvent<Track>["detail"];
    action: Track;
    click: Track;
  }>();

  export let sm = false;
  export let fixed = false;
  export let selected = new Set<Track>();
  export let tracks: (Track | undefined)[] | undefined = undefined;

  const prerender = 10;
  $: items = tracks || Array.from<undefined>({ length: prerender });
  $: if (!tracks?.length) clear();

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
</script>

<div>
  {#if !sm}
    <When lg>
      <div
        class="sticky top-11 z-10 grid auto-cols-fr grid-flow-col border-b border-b-highlight bg-surface/70 pl-20 pr-16 backdrop-blur-md"
      >
        <Header sm>Title</Header>
        <Header sm>Artist</Header>
        <Header sm>Album</Header>
      </div>
    </When>
  {/if}
  <Virtual
    key={(x) => x?.entry || x?.id}
    sortable="tracks"
    let:item={track}
    {prerender}
    {fixed}
    {items}
    animate
    on:edit
    on:end
  >
    <div class="[&_hr]:!opacity-100 [*:has(>&):last-of-type_hr]:!opacity-0">
      {#if track}
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
              on:click={() =>
                selected.size ? select(track) : dispatch("click", track)}
              on:contextmenu={(e) => (e.preventDefault(), select(track))}
            />
            <Icon name="list" slot="after" />
          </Swipeable>
        {:else}
          <TrackUI
            {sm}
            {track}
            selected={check(track, selected)}
            on:click={() => dispatch("click", track)}
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
        <Stack x grow>
          <slot />
          <Separator />
          <Button air square on:click={clear}><Icon name="close" /></Button>
        </Stack>
      </Panel>
    {/if}
  </Portal>
{/if}
