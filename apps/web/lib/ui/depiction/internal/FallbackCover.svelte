<script lang="ts">
  import type { Either } from "@amadeus-music/ui/internal/types";
  import type { MediaType } from "@amadeus-music/protocol";
  import { Icon } from "@amadeus-music/ui";

  type $$Props = {
    of: MediaType;
    id?: number;
  } & Either<"xxl" | "xl">;

  export let xxl: any = false;
  export let xl: any = false;
  export let of: MediaType;
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
  class="flex size-full items-center justify-center text-white"
  style:background-image="linear-gradient(to right,#fb7185,#f87171)"
  style:filter="hue-rotate({id}deg)"
>
  <Icon of={icon} {xxl} {xl} />
</div>
