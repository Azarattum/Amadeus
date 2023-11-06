<script lang="ts">
  import {
    Sidenav,
    Navbar,
    Spacer,
    Header,
    Button,
    Icon,
  } from "@amadeus-music/ui";

  const icons: Record<string, string> = {
    Recommended: "stars",
    Listened: "history",
    Following: "people",
    Explore: "compass",
    Playlists: "last",
    Artists: "people",
    Timeline: "clock",
    Feed: "activity",
    Library: "note",
    Tracks: "note",
    Albums: "disk",
    Home: "house",
  };

  const sections: Record<string, string[]> = {
    Home: ["Feed", "Listened", "Recommended", "Following"],
    Library: ["Playlists", "Artists", "Timeline"],
    Explore: ["Tracks", "Artists", "Albums"],
  };

  let section = "Home";
  let subsection = "Listened";
  $: subsection = sections[section][0];
</script>

<Sidenav class="hidden sm:flex">
  {#each Object.keys(sections) as x}
    <Button
      compact
      stretch
      air
      primary={x === section}
      on:click={() => (section = x)}
    >
      <Icon of={icons[x]} md />{x}
    </Button>
  {/each}
  <Spacer />
  <Button compact stretch air>
    <Icon of="settings" md />Settings
  </Button>
  <svelte:fragment slot="secondary">
    <Header sm>{section}</Header>
    {#each sections[section] as x}
      <Button air primary={x === subsection} on:click={() => (subsection = x)}>
        <Icon of={icons[x]} />{x}
      </Button>
    {/each}
  </svelte:fragment>
</Sidenav>
<Navbar class="absolute bottom-0 sm:hidden">
  {#each Object.keys(sections) as x}
    <Button
      compact
      stretch
      air
      primary={x === section}
      on:click={() => (section = x)}
    >
      <Icon of={icons[x]} md />{x}
    </Button>
  {/each}
</Navbar>
