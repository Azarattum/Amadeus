<script lang="ts">
  import {
    type Classes,
    Swipeable,
    Image,
    Stack,
    Text,
    Card,
    Icon,
    tw,
  } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    action: Track;
    select: Track;
  }>();

  let classes: Classes = "";
  export { classes as class };
  export let sm = false;
  export let progress = 0;
  export let selected: "passive" | boolean = false;
  export let track: Track | undefined = undefined;

  $: [primary = undefined, ...sub] = track?.title.split("(") || [];
  $: secondary = sub.length ? "(" + sub.join("(") : "";
</script>

<Swipeable
  disabled={!$$slots.action || !track}
  on:before={() => track && dispatch("action", track)}
  on:after={() => track && dispatch("select", track)}
>
  <slot name="action" slot="before" />
  <Card
    selected={selected === true}
    class={classes}
    fixed={sm}
    on:contextmenu
    on:click
  >
    <Image
      thumbnail={track ? track.album.thumbnails?.[0] || "" : undefined}
      src={track ? track.album.arts?.[0] || "" : undefined}
      class="rounded"
      slot="before"
    >
      <div
        class="flex size-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
        style:filter="hue-rotate({track?.id || 0}deg)"
      >
        <Icon of="note" />
      </div>
    </Image>
    <Text accent loading={!track}>
      {primary}
      <Text secondary>{secondary}</Text>
    </Text>
    <Text secondary sm loading={!track}>
      {track?.artists.map((x) => x.title).join(", ")}
    </Text>
    {#if !sm}
      <Text secondary sm class="hidden lg:inline" loading={!track}>
        {track?.album.title}
      </Text>
    {/if}
    <svelte:fragment slot="after">
      {#if $$slots.default}
        <slot />
      {:else}
        <Stack z class="text-primary-600">
          <Icon
            of="circle"
            class={tw`transition-opacity ${!selected && "opacity-0"}`}
          />
          <Icon
            of="target"
            class={tw`transition-transform ${selected !== true && "scale-0"}`}
          />
        </Stack>
      {/if}
    </svelte:fragment>
    {#if progress}
      <div
        class="absolute bottom-0 left-0 h-0.5 w-full origin-left transform-gpu bg-highlight-200 transition-transform duration-1000"
        style:transform="scaleX({progress})"
      />
    {/if}
  </Card>
  <Icon of="list" slot="after" />
</Swipeable>
