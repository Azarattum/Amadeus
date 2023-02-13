<script lang="ts">
  import { mock, playlists } from "@amadeus-music/crdata";
  import { Button } from "@amadeus-music/ui";
  import { onMount } from "svelte";

  onMount(async () => {
    /// For testing
    await mock();
    console.log($playlists);
  });
</script>

<!-- ///Temporary example!!! -->
<h1 class="font-extrabold text-emerald-600">hello</h1>
<Button>Click Me!</Button>
