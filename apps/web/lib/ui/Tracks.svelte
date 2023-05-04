<script lang="ts" context="module">
  export type EditEvent<T> = CustomEvent<{
    action: "push" | "purge" | "rearrange";
    item: T;
    index: number;
  }>;
</script>

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
  } from "@amadeus-music/ui";
  import type { TrackInfo } from "@amadeus-music/protocol";
  import { createEventDispatcher } from "svelte";
  import Track from "./Track.svelte";
  type T = $$Generic<TrackInfo & { entry?: number; id?: number }>;

  const dispatch = createEventDispatcher<{
    action: T;
    click: T;
    edit: {
      action: "push" | "purge" | "rearrange";
      item: T;
      index: number;
    };
  }>();

  export let sm = false;
  export let tracks: T[];
  export let selected = new Set<T>();
  $: if (!tracks.length) clear();

  function select(track: T) {
    if (selected.has(track)) selected.delete(track);
    else selected.add(track);
    selected = selected;
  }

  function check(track: T, selection: Set<T>) {
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
  {#if !sm && tracks.length}
    <When lg>
      <div
        class="sticky top-11 z-50 grid auto-cols-fr grid-flow-col border-b border-b-highlight bg-surface/70 pl-20 pr-16 backdrop-blur-md"
      >
        <Header sm>Title</Header>
        <Header sm>Artist</Header>
        <Header sm>Album</Header>
      </div>
    </When>
  {/if}
  <Virtual
    key={(x) => x.entry ?? x.id ?? x}
    sortable="tracks"
    let:item={track}
    items={tracks}
    animate
    on:edit
    on:end
  >
    <!-- /// TODO: fix `hr` between tracks -->
    <!-- <div class="[&_hr]:!opacity-100 [&_hr]:last-of-type:!opacity-0"> -->
    {#if $$slots.default || $$slots.action}
      <Swipeable
        on:before={() => dispatch("action", track)}
        on:after={() => select(track)}
      >
        <slot name="action" slot="before" />
        <Track
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
      <Track
        {sm}
        {track}
        selected={check(track, selected)}
        on:click={() => dispatch("click", track)}
      />
    {/if}
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
