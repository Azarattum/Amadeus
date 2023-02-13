<script lang="ts">
  import { playlists } from "@amadeus-music/crdata/stores";
  import { Button } from "@amadeus-music/ui";

  $: console.log($playlists);
</script>

<!-- ///Temporary example!!! -->
<h1 class="font-extrabold text-emerald-600">hello</h1>
<Button>Click Me!</Button>
