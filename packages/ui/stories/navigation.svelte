<script lang="ts">
  import { Nav, Button, Icon } from "@amadeus-music/ui";

  const icons: Record<string, string> = {
    Home: "house",
    Library: "note",
    Explore: "compass",
    Added: "last",
    Playlists: "queue",
    Artists: "artists",
    Timeline: "clock",
    Tracks: "note",
    Albums: "album",
    Listened: "history",
    Recommended: "stars",
    Following: "artists",
  };

  const sections: Record<string, string[]> = {
    Home: ["Added", "Listened", "Recommended", "Following"],
    Library: ["Playlists", "Artists", "Timeline"],
    Explore: ["Tracks", "Artists", "Albums"],
  };

  let section = "Home";
  let subsection = "Listened";
  $: subsection = sections[section][0];
</script>

<Nav {section}>
  {#each Object.keys(sections) as x}
    <Button
      air
      compact
      stretch
      active={x === section}
      on:click={() => (section = x)}
    >
      <Icon md name={icons[x]} />{x}
    </Button>
  {/each}
  <svelte:fragment slot="section">
    {#each sections[section] as x}
      <Button air active={x === subsection} on:click={() => (subsection = x)}>
        <Icon name={icons[x]} />{x}
      </Button>
    {/each}
  </svelte:fragment>
  <Button air compact stretch slot="bottom">
    <Icon md name="settings" />Settings
  </Button>
</Nav>
