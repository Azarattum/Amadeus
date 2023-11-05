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
    Home: "house",
    Feed: "activity",
    Library: "note",
    Explore: "compass",
    Playlists: "last",
    Artists: "people",
    Timeline: "clock",
    Tracks: "note",
    Albums: "disk",
    Listened: "history",
    Recommended: "stars",
    Following: "people",
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
      air
      compact
      stretch
      primary={x === section}
      on:click={() => (section = x)}
    >
      <Icon md name={icons[x]} />{x}
    </Button>
  {/each}
  <Spacer />
  <Button air compact stretch>
    <Icon md name="settings" />Settings
  </Button>
  <svelte:fragment slot="secondary">
    <Header sm>{section}</Header>
    {#each sections[section] as x}
      <Button air primary={x === subsection} on:click={() => (subsection = x)}>
        <Icon name={icons[x]} />{x}
      </Button>
    {/each}
  </svelte:fragment>
</Sidenav>
<Navbar class="absolute bottom-0 sm:hidden">
  {#each Object.keys(sections) as x}
    <Button
      air
      compact
      stretch
      primary={x === section}
      on:click={() => (section = x)}
    >
      <Icon md name={icons[x]} />{x}
    </Button>
  {/each}
</Navbar>
