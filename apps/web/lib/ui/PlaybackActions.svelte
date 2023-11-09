<script lang="ts">
  import { Tooltip, Button, Icon } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { playback } from "$lib/data";

  export let selected: Track[];
</script>

<Button air on:click={() => playback.push(selected, "last")}>
  <Icon of="last" /><Tooltip>Play Last</Tooltip>
</Button>
<Button air on:click={() => playback.push(selected, "next")}>
  <Icon of="next" /><Tooltip>Play Next</Tooltip>
</Button>
<Button air on:click={() => playback.push(selected, "random")}>
  <Icon of="shuffle" /><Tooltip>Play Randomly</Tooltip>
</Button>
