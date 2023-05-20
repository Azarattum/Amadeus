<script lang="ts">
  import { Header, Icon, Stack, Topbar, Button, When } from "@amadeus-music/ui";
  import { onMount } from "svelte";

  const types: Record<number, string> = { 0: "Listened", 1: "Recommended" };
  onMount(() => {
    if (!location.hash) location.replace("#feed");
  });
</script>

<Topbar title="Home">
  <Header xl indent id="feed">
    Home
    <When not sm slot="after">
      <Button round href="/settings"><Icon name="settings" /></Button>
    </When>
  </Header>
</Topbar>
<Stack p grow gap="lg">
  <Header sm>Other Devices</Header>
  <!-- /// TODO add playback stuff -->
  <!-- /// Do proper prerendering -->
  <!-- /// TODO replace with in-app card component -->

  <Header id="following" sm>New for You</Header>
  <!-- /// TODO add artists cards -->
</Stack>

<svelte:head>
  <title>Amadeus</title>
</svelte:head>
