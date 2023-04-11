<script lang="ts">
  import { Tab, Tabs, LightSwitch, Stack } from "@amadeus-music/ui";
  import Content from "./content.svelte";
</script>

<Stack screen center>
  <LightSwitch />
  <Tabs>
    <Tab name="Playlists">
      <Content i={20} />
    </Tab>
    <Tab name="Artists">
      <Content i={30} />
    </Tab>
    <Tab name="Timeline">
      <Content i={10} />
    </Tab>
  </Tabs>
</Stack>
