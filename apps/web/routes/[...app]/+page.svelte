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
    <Gateway for="sections" slot="sections" />
    <Projection at="home" let:visible let:active>
      <Home {visible} {active} {hash} {page} />
    </Projection>
    <Projection at="library" let:visible let:active>
      <Library {visible} {active} {hash} {page} />
    </Projection>
    <Projection at="explore" let:visible let:active>
      <Explore {visible} {active} {hash} {page} />
    </Projection>
    <Projection at="settings"><Settings /></Projection>
  </Shell>
</Hologram>
