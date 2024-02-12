<script lang="ts">
  import {
    Spinner,
    Button,
    Stack,
    Image,
    Range,
    Text,
    Icon,
    tw,
  } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { format } from "@amadeus-music/util/time";
  import { scale } from "svelte/transition";

  export let track: Track | undefined = undefined;
  export let currentTime = 0;
  export let loading = false;
  export let paused = true;
</script>

<Stack class="place-items-center gap-1 p-4">
  <Text accent>{track?.title || "Not Playing"}</Text>
  <Button
    primary
    slim
    air
    href={track?.artists.length === 1
      ? `/explore/artist#${track.artists[0].id}`
      : undefined}
    disabled={!track}
  >
    {track?.artists.map((x) => x.title).join(", ") || "\u202F"}
  </Button>
</Stack>
<div class="px-11">
  <label class="relative block cursor-pointer rounded-2xl shadow-xl">
    <input
      class="peer absolute inset-0 appearance-none rounded-2xl outline-2 outline-offset-8 outline-primary-600 focus-visible:outline"
      type="checkbox"
      bind:checked={paused}
    />

    <Image src={track?.album.arts?.[0] || null} size={324}>
      <div
        class={tw`flex size-full items-center justify-center
          ${track ? "bg-gradient-to-r from-rose-400 to-red-400 text-white" : "bg-surface-200 text-content-200"}`}
        style:filter="hue-rotate({track?.id || 0}deg)"
      >
        <Icon of="note" xxl />
      </div>
    </Image>
    <div
      class="absolute -inset-[1px] flex items-center justify-center rounded-2xl bg-surface-200 opacity-0 backdrop-blur transition-[opacity] duration-300 peer-checked:opacity-100"
      class:opacity-100={loading}
    >
      {#if loading}
        <div class="absolute" transition:scale>
          <Spinner color="hsl(var(--color-content))" />
        </div>
      {:else}
        <div class="pause absolute" transition:scale />
      {/if}
    </div>
  </label>
</div>
<Range
  controls
  hints
  p
  max={track?.duration || 0}
  {format}
  bind:value={currentTime}
  on:forward
  on:rewind
  on:reset
/>

<style>
  .pause {
    --size: 64px;
    content: "";

    border-color: transparent transparent transparent hsl(var(--color-content));
    transition-property: height border-width border-style;
    transition: 0.3s ease;

    height: var(--size);
    border-style: double;
    border-width: 0 0 0 calc(var(--size) / 1.2);
  }

  input:checked ~ div > .pause {
    border-style: solid;
    border-width: calc(var(--size) / 2) 0 calc(var(--size) / 2)
      calc(var(--size) / 1.2);
  }
</style>
