<script lang="ts">
  import { Header, Icon, Stack, Topbar, Button, When } from "@amadeus-music/ui";
  import Overview from "$lib/ui/Overview.svelte";
  import { feed, search } from "$lib/data";
  import { onMount } from "svelte";

  const hidden = new Set([-3, -4]);
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
<Stack p grow gap="sm">
  <Header sm>Other Devices</Header>
  <!-- /// TODO add playback stuff -->
  <!-- /// Do proper prerendering -->
  <Header sm>You Might Like</Header>
  <Overview
    style="playlist"
    filter={$search}
    of={$feed.filter((x) => !hidden.has(x.id))}
    href="/home"
  />
  <!-- /// TODO replace with in-app card component -->

  <!-- <Header id="following" sm>New for You</Header> -->
  <!-- /// TODO add artists cards -->
</Stack>

<svelte:head>
  <title>Amadeus</title>
</svelte:head>
