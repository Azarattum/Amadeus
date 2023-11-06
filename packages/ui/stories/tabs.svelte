<script lang="ts">
  import { LightSwitch, Stack, Tabs, Tab } from "@amadeus-music/ui";
  import Content from "./content.svelte";
</script>

<Tabs>
  <Tab name="Playlists">
    <Content i={20} />
    <Stack class="place-items-center p-4"><LightSwitch /></Stack>
  </Tab>
  <Tab name="Artists">
    <Content i={30} />
    <Stack class="place-items-center p-4"><LightSwitch /></Stack>
  </Tab>
  <Tab name="Timeline">
    <Content i={10} />
    <Stack class="place-items-center p-4"><LightSwitch /></Stack>
  </Tab>
</Tabs>
