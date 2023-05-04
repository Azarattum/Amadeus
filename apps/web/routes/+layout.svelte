<script lang="ts">
  import {
    Wrapper,
    Stack,
    Nav,
    Button,
    Icon,
    Input,
    LightSwitch,
  } from "@amadeus-music/ui";
  import { beforeNavigate, preloadData } from "$app/navigation";
  import { capitalize } from "@amadeus-music/util/string";
  import { autoscroll } from "@amadeus-music/ui/action";
  import { page } from "$app/stores";
  import { search } from "$lib/data";
  import { base } from "$app/paths";
  import { onMount } from "svelte";
  import "@amadeus-music/ui";

  const splashes = [
    [320, 568, 2, "5"],
    [375, 667, 2, "8"],
    [375, 812, 3, "x"],
    [414, 736, 3, "plus"],
  ];

  const icons: Record<string, string> = {
    Home: "house",
    Library: "note",
    Explore: "compass",
    Playlists: "last",
    Artists: "artists",
    Timeline: "clock",
    Tracks: "note",
    Albums: "album",
    Listened: "history",
    Recommended: "stars",
    Following: "artists",
  };

  const urls: Record<string, string> = {
    Listened: "/home/feed#0",
    Recommended: "/home/feed#1",
  };

  const sections: Record<string, string[]> = {
    Home: ["Listened", "Recommended", "Following"],
    Library: ["Playlists", "Artists", "Timeline"],
    Explore: ["Tracks", "Artists", "Albums"],
  };
  $: section = capitalize($page.route.id?.split("/")?.[1] || "home");

  function toURL(target: string): string {
    if (target in urls) return urls[target];
    if (target in sections) return `/${target.toLowerCase()}`;
    return `${toURL(section)}#${target.toLowerCase()}`;
  }

  beforeNavigate(() => {
    $search = "";
  });

  onMount(() => {
    preloadData("/");
    preloadData("/library");
    preloadData("/explore");
  });
</script>

<Wrapper>
  <Nav {section}>
    {#each Object.keys(sections) as x}
      <Button air compact stretch primary={x === section} href={toURL(x)}>
        <Icon md name={icons[x]} />{x}
      </Button>
    {/each}
    <svelte:fragment slot="section">
      {#each sections[section] || [] as x (x)}
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
    <div class="hidden gap-16 p-[21px] pb-0 sm:flex">
      <Input bind:value={$search} stretch resettable placeholder="Search">
        <Icon name="search" />
      </Input>
      <LightSwitch />
    </div>
    <div use:autoscroll class="relative h-full overflow-y-scroll scroll-smooth">
      <slot />
    </div>
  </Stack>
</Wrapper>

<svelte:head>
  <title>Amadeus</title>
  <meta name="description" content="Listen to your music with Amadeus!" />
  <link rel="icon" type="image/png" href="{base}/images/favicon.webp" />
  <link rel="apple-touch-icon" href="{base}/images/logo-180.webp" />
  <link rel="manifest" href="{base}/manifest.json" />
  {#each splashes as [w, h, r, image]}
    <link
      rel="apple-touch-startup-image"
      media="(device-width: {w}px) and (device-height: {h}px) and (-webkit-device-pixel-ratio: {r})"
      href="{base}/images/splash-{image}.webp"
    />
  {/each}
</svelte:head>
