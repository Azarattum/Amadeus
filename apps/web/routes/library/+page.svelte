<script lang="ts">
  import { Tab, Tabs } from "@amadeus-music/ui";
  import Playlists from "./playlists.svelte";
  import Artists from "./artists.svelte";
</script>

<Tabs>
  <Tab name="Playlists">
    <Playlists />
  </Tab>
  <Tab name="Artists">
    <Artists />
  </Tab>
  <Tab name="Timeline">
    <div class="animate-bounce text-center text-xl font-extralight opacity-50">
      Coming soon...
    </div>
  </Tab>
</Tabs>
