<script lang="ts">
  import { Tab, Tabs, LightSwitch, Stack } from "@amadeus-music/ui";
  import Content from "./content.svelte";
</script>

<Tabs>
  <Tab name="Playlists">
    <Content i={20} />
    <Stack center p><LightSwitch /></Stack>
  </Tab>
  <Tab name="Artists">
    <Content i={30} />
    <Stack center p><LightSwitch /></Stack>
  </Tab>
  <Tab name="Timeline">
    <Content i={10} />
    <Stack center p><LightSwitch /></Stack>
  </Tab>
</Tabs>
