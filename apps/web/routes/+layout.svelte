<script lang="ts">
  import {
    Wrapper,
    Stack,
    Nav,
    Button,
    Icon,
    When,
    Input,
    LightSwitch,
  } from "@amadeus-music/ui";
  import { capitalize } from "@amadeus-music/util/string";
  import { preloadData } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  const icons: Record<string, string> = {
    Home: "house",
    Library: "note",
    Explore: "compass",
    Added: "last",
    Playlists: "last",
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
  $: section = capitalize($page.route.id?.slice(1) || "home");

  function toURL(section: string): string {
    if (section in sections) {
      return `/${section === "Home" ? "" : section.toLowerCase()}`;
    }
    return `#${section.toLowerCase()}`;
  }

  onMount(() => {
    preloadData("/");
    preloadData("/library");
    preloadData("/explore");
  });
</script>

<Wrapper>
  <Stack x grow>
    <Nav {section}>
      {#each Object.keys(sections) as x}
        <Button air compact stretch primary={x === section} href={toURL(x)}>
          <Icon md name={icons[x]} />{x}
        </Button>
      {/each}
      <svelte:fragment slot="section">
        {#each sections[section] || [] as x}
          <Button air href={toURL(x)}>
            <Icon name={icons[x]} />{x}
          </Button>
        {/each}
      </svelte:fragment>
      <Button air compact stretch slot="bottom" href="/settings">
        <Icon md name="settings" />Settings
      </Button>
    </Nav>
    <Stack screen grow>
      <When sm>
        <Stack p x gap="2xl">
          <Input stretch placeholder="Search"><Icon name="search" /></Input>
          <LightSwitch />
        </Stack>
      </When>
      <slot />
    </Stack>
  </Stack>
</Wrapper>
