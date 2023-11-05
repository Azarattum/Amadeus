<script lang="ts">
  import {
    Projection,
    Hologram,
    Button,
    Header,
    Spacer,
    Icon,
    link,
    When,
  } from "@amadeus-music/ui";
  import { capitalize } from "@amadeus-music/util/string";
  import Settings from "./settings/-page.svelte";
  import Library from "./library/-page.svelte";
  import Explore from "./explore/-page.svelte";
  import Shell from "$lib/ui/Shell.svelte";
  import Home from "./home/-page.svelte";

  const icons: Record<string, string> = {
    home: "house",
    feed: "activity",
    library: "note",
    explore: "compass",
    playlists: "last",
    artists: "people",
    timeline: "clock",
    tracks: "note",
    albums: "disk",
    listened: "history",
    recommended: "stars",
    following: "people",
  };

  const urls: Record<string, string> = {
    recommended: "/home/playlist#-2",
    listened: "/home/playlist#-1",
  };

  const sections: Record<string, string[]> = {
    home: ["feed", "following", "listened", "recommended"],
    library: ["playlists", "artists", "timeline"],
    explore: ["tracks", "artists", "albums"],
  };
</script>

<Hologram of="app" let:page let:root let:hash>
  {@const section = page.split("/")[0] || "home"}
  <Shell>
    <svelte:fragment slot="tabs">
      {#each Object.keys(sections) as x}
        <Button air compact stretch primary={x === section} href={link(x)}>
          <Icon md name={icons[x]} />{capitalize(x)}
        </Button>
      {/each}
      <When sm>
        <Spacer />
        <Button air compact stretch href={link("settings")}>
          <Icon md name="settings" />Settings
        </Button>
      </When>
    </svelte:fragment>
    <svelte:fragment slot="sections">
      <Header sm>{section}</Header>
      {#each sections[section] || [] as x (section + x)}
        <Button
          to={section === "explore" ? x : undefined}
          href={urls[x] || `${root}/${section}/#${x}`}
          primary={x === hash}
          air
        >
          <Icon name={icons[x]} />{capitalize(x)}
        </Button>
      {/each}
      <!-- /// TODO: fix $extra -->
      <!-- {#if pageToName(page, hash)}
        <Separator />
        <Button air primary>
          <Icon name="person" />{pageToName(page, hash)}
        </Button>
      {/if} -->
    </svelte:fragment>
    <Projection at="home" let:target><Home {target} /></Projection>
    <Projection at="library" let:target><Library {target} /></Projection>
    <Projection at="explore" let:target><Explore {target} /></Projection>
    <Projection at="settings"><Settings /></Projection>
  </Shell>
</Hologram>
