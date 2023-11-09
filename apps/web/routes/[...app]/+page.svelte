<script lang="ts">
  import {
    Projection,
    Hologram,
    Gateway,
    Button,
    Spacer,
    Icon,
    link,
    When,
  } from "@amadeus-music/ui";
  import Settings from "./settings/-page.svelte";
  import Library from "./library/-page.svelte";
  import Explore from "./explore/-page.svelte";
  import Shell from "$lib/ui/Shell.svelte";
  import Home from "./home/-page.svelte";
  import { search } from "$lib/data";
</script>

<Hologram of="app" let:page let:hash>
  {@const tab = page.split("/")[0] || "home"}
  <Shell>
    <svelte:fragment slot="tabs">
      <Button compact air primary={tab === "home"} href={link("home")}>
        <Icon of="house" md />Home
      </Button>
      <Button compact air primary={tab === "library"} href={link("library")}>
        <Icon of="note" md />Library
      </Button>
      <Button compact air primary={tab === "explore"} href={link("explore")}>
        <Icon of="compass" md />Explore
      </Button>
      <When sm>
        <Spacer />
        <Button compact air href={link("settings")}>
          <Icon of="settings" md />Settings
        </Button>
      </When>
    </svelte:fragment>
    <Gateway for="navigation" slot="sections" />
    <Projection at="home" title="Amadeus" let:visible let:active>
      <Home {visible} {active} {hash} {page} />
    </Projection>
    <Projection at="library" title="Library - Amadeus" let:visible let:active>
      <Library {visible} {active} {hash} {page} />
    </Projection>
    <Projection
      at="explore"
      title="{$search || 'Explore'} - Amadeus"
      let:visible
      let:active
    >
      <Explore {visible} {active} {hash} {page} />
    </Projection>
    <Projection at="settings" title="Settings - Amadeus">
      <Settings />
    </Projection>
  </Shell>
</Hologram>
