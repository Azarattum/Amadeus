<script lang="ts">
  import {
    Stack,
    Text,
    Button,
    Image,
    Icon,
    Spinner,
    Range,
  } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { format } from "@amadeus-music/util/string";
  import { scale } from "svelte/transition";

  export let track: Track | undefined = undefined;
  export let currentTime = 0;
  export let loading = false;
  export let paused = true;
</script>

<Stack p gap="sm" center>
  <Text accent>{track?.title || "Not Playing"}</Text>
  <Button
    air
    primary
    slim
    disabled={!track}
    href={track?.artists.length === 1
      ? `/explore/artist#${track.artists[0].id}`
      : undefined}
  >
    {track?.artists.map((x) => x.title).join(", ") || "\u202F"}
  </Button>
</Stack>
<div class="px-11">
  <label class="relative block cursor-pointer rounded-2xl shadow-xl">
    <input
      type="checkbox"
      class="peer absolute inset-0 appearance-none rounded-2xl outline-2 outline-offset-8 outline-primary-600 focus-visible:outline"
      bind:checked={paused}
    />

    <Image src={track?.album.arts?.[0]} size={324}>
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
        style:filter="hue-rotate({track?.id || 0}deg)"
      >
        <Icon name="note" />
      </div>
    </Image>
    <div
      class="absolute -inset-[1px] flex items-center justify-center rounded-2xl bg-surface-200 opacity-0 backdrop-blur transition-[opacity] duration-300 peer-checked:opacity-100"
      class:opacity-100={loading}
    >
      {#if loading}
        <div transition:scale class="absolute">
          <Spinner color="hsl(var(--color-content))" />
        </div>
      {:else}
        <div class="pause absolute" transition:scale />
      {/if}
    </div>
  </label>
</div>
<Range
  {format}
  max={track?.duration || 0}
  bind:value={currentTime}
  on:forward
  on:rewind
  on:reset
  controls
  hints
  p
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
