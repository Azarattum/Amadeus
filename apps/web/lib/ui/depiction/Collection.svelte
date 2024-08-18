<script lang="ts">
  import {
    type Classes,
    Header,
    Topbar,
    Spacer,
    Stack,
    Morph,
    Words,
    Icon,
    Text,
    tw,
  } from "@amadeus-music/ui";
  import {
    type Playlist,
    type Artist,
    type Track,
    type Album,
  } from "@amadeus-music/protocol";
  import { capitalize, nully } from "@amadeus-music/util/string";
  import type { Either } from "@amadeus-music/ui/internal/types";
  import { gather, unique, which, ok } from "$lib/util/props";
  import { format } from "@amadeus-music/util/time";
  import { match } from "$lib/util/search";
  import { playback } from "$lib/data";
  import { PlaybackActions } from "..";
  import Tracks from "./Tracks.svelte";
  import Cover from "./Cover.svelte";

  type $$Props = {
    editable?: boolean;
    tracks?: Track[];
    class?: Classes;
    filter?: string;
    href?: string;
  } & Either<{
    playlist: Playlist | true;
    artist: Artist | true;
    album: Album | true;
  }>;

  export let playlist: Playlist | true | undefined = undefined;
  export let artist: Artist | true | undefined = undefined;
  export let album: Album | true | undefined = undefined;
  export let tracks: Track[] | undefined = undefined;
  export let href: string | undefined = undefined;
  /// TODO: infer editable by presence of `onedit` handler in Svelte 5
  export let editable = false;
  export let filter = "";

  $: matcher = match(filter);
  $: [type, media] = which({ playlist, artist, album });
  $: collection = (tracks || media?.collection?.tracks)?.filter(matcher);

  $: details = ok(album)?.artists?.map((x) => x.title) ||
    which({ artist, album })[1]
      ?.sources.map((x: string) => capitalize(x.split("/")[0]))
      .filter((x): x is string => !!x) || ["Loading"];
</script>

<Topbar title={media?.title}>
  <Stack x class={`place-items-center gap-4 ${!playlist ? "p-4" : "pb-4"}`}>
    {#if !playlist || media}
      <Cover
        {...gather({ playlist, artist, album })}
        class={tw`${playlist ? "pointer-events-none absolute left-4 top-[137px] gap-2 lg:top-[170px] [&_img:is([inert])]:!visible [&_img:not([inert])]:hidden" : "ring-highlight transition-transform active:scale-95 hover:ring-8"}`}
        morph={nully`thumb-${type}-${media?.id}`}
        md={!playlist}
        {href}
      />
    {/if}
    <Stack class="z-20 grow-0 gap-2">
      <Morph container key="heading-{type}-{media?.id}">
        <Header indent={!!playlist} loading={!media} xl={!!playlist}>
          <!-- This div is needed for the container morph -->
          <div>
            <Morph key="title-{type}-{media?.id}">
              <Words from={media?.title ?? "Loading"} />
            </Morph>
          </div>
        </Header>
      </Morph>
      <Morph key={`meta-${type}-${media?.id}`}>
        <Stack x class="max-w-max gap-4 {type === 'playlist' ? 'ml-4' : ''}">
          {#if media?.collection}
            <Text secondary>
              <Icon of="note" sm />
              {media.collection.size}
            </Text>
            <Text secondary>
              <Icon of="clock" sm />
              {format(media.collection.duration)}
            </Text>
            {#if "remote" in media && media.remote}
              <Spacer />
              <Text secondary><Icon of="share" sm /> {media.remote}</Text>
            {/if}
          {:else}
            <Text secondary indent={!!playlist} loading={!media}>
              {#if artist}
                <Icon of="globe" sm />
              {/if}
              {unique(details).join(", ")}
            </Text>
          {/if}
        </Stack>
      </Morph>
    </Stack>
  </Stack>
</Topbar>
<!-- /// TODO: albums -->

<Morph
  loosely
  class={`${playlist && "[&_li:nth-child(-n+4)_img]:invisible"}`}
  key={nully`${type}-${media?.id}`}
>
  <Tracks
    editable={editable && !filter}
    tracks={collection}
    on:action={({ detail }) => playback.push([detail], "last")}
    let:selected
    on:click
    on:edit
    on:end
  >
    <!-- /// TODO: support other quick actions -->
    <Icon of="last" slot="action" />
    <PlaybackActions {selected} />
    <slot {selected} />
  </Tracks>
</Morph>
