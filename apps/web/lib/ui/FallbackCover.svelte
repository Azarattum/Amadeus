<script lang="ts">
  import type { MediaType } from "@amadeus-music/protocol";
  import { Icon } from "@amadeus-music/ui";

  export let of: MediaType;
  export let xl = false;
  export let id = 0;

  $: icon = (
    {
      artist: "person",
      album: "disk",
      track: "note",
    } as const satisfies Record<MediaType, string>
  )[of];
</script>

<div
  class="flex size-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
  style:filter="hue-rotate({id}deg)"
>
  <Icon of={icon} {xl} />
</div>
