<script lang="ts" context="module">
  export type EditEvent<T> = CustomEvent<{
    action: "push" | "purge" | "rearrange";
    item: T;
    index: number;
  }>;
</script>

<script lang="ts">
  import {
    Header,
    Virtual,
    When,
    Portal,
    Button,
    Icon,
    Swipeable,
  } from "@amadeus-music/ui";
  import type { TrackInfo } from "@amadeus-music/protocol";
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
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
</script>

{#if !sm && tracks.length}
  <When lg>
    <div
      class="sticky top-0 z-50 grid auto-cols-fr grid-flow-col border-b border-b-highlight bg-surface-200 pl-20 pr-16 backdrop-blur-lg"
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

{#if $$slots.default || $$slots.action}
  <Portal to="bottom">
    {#if selected.size}
      <aside
        transition:fly={{ y: 50 }}
        class="relative left-1/2 mx-4 mb-2 flex max-w-md -translate-x-1/2 rounded-lg border border-highlight bg-surface-200 backdrop-blur-lg"
        style:grid-template-columns="repeat(auto-fit,minmax(0,1fr)) 44px"
      >
        <div class="grid grow auto-cols-fr grid-flow-col">
          <slot />
        </div>
        <div class="min-w-[3rem] border-l border-highlight">
          <Button
            air
            stretch
            on:click={() => (selected.clear(), (selected = selected))}
          >
            <Icon name="close" />
          </Button>
        </div>
      </aside>
    {/if}
  </Portal>
{/if}
