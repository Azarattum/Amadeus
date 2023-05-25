<script lang="ts">
  import {
    Wrapper,
    Stack,
    Nav,
    Button,
    Icon,
    Input,
    Separator,
    LightSwitch,
  } from "@amadeus-music/ui";
  import { beforeNavigate, preloadData } from "$app/navigation";
  import { capitalize } from "@amadeus-music/util/string";
  import { autoscroll } from "@amadeus-music/ui/action";
  import { extra, search, update } from "$lib/data";
  import { sql } from "@amadeus-music/crdata";
  import Player from "$lib/ui/Player.svelte";
  import { page } from "$app/stores";
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

  const urls: Record<string, string> = {
    Recommended: "/home/feed#recommended",
    Listened: "/home/feed#listened",
  };

  const sections: Record<string, string[]> = {
    Home: ["Feed", "Following", "Listened", "Recommended"],
    Library: ["Playlists", "Artists", "Timeline"],
    Explore: ["Tracks", "Artists", "Albums"],
  };
  $: section = capitalize($page.route.id?.split("/")?.[1] || "home") as string;

  function toURL(target: string): string | undefined {
    if (target in urls) return urls[target];
    if (target in sections) return `/${target.toLowerCase()}`;
    if (section === "Explore") return undefined;
    return `${toURL(section)}#${target.toLowerCase()}`;
  }

  function toTarget(target: string) {
    if (section !== "Explore") return undefined;
    return target.toLowerCase();
  }

  beforeNavigate(({ from, to }) => {
    if (from?.url.pathname === to?.url.pathname) return;
    $extra = null;
    $search = "";
  });

  onMount(() => {
    preloadData("/home");
    preloadData("/home/feed");
    preloadData("/library");
    preloadData("/library/playlist");
    preloadData("/library/artist");
    preloadData("/explore");

    // Utilities to inspect the database during development
    if (import.meta.env.DEV) {
      (globalThis as any).db = {
        exec: (query: any) =>
          update((db) =>
            sql
              .raw(query)
              .execute(db)
              .then((x) => x.rows)
          ),
        show: (table: any) =>
          update((db) => db.selectFrom(table).selectAll().execute()),
      };
    }
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
      {#each sections[section] || [] as x (section + x)}
        <Button air href={toURL(x)} to={toTarget(x)}>
          <Icon name={icons[x]} />{x}
        </Button>
      {/each}
      {#if $extra}
        <Separator />
        <Button air primary><Icon name={$extra[1]} />{$extra[0]}</Button>
      {/if}
    </svelte:fragment>
    <Button air compact stretch slot="bottom" href="/settings">
      <Icon md name="settings" />Settings
    </Button>
  </Nav><Player /><Stack screen grow>
    <div class="hidden gap-16 p-[21px] pb-0 sm:flex">
      <Input bind:value={$search} stretch resettable placeholder="Search">
        <Icon name="search" />
      </Input>
      <LightSwitch />
    </div>
    <div
      use:autoscroll
      class="relative h-full scroll-smooth
      {section == 'Library' ? 'overflow-hidden' : 'overflow-y-auto'}"
    >
      <slot />
    </div>
  </Stack>
</Wrapper>

<svelte:head>
  <meta name="description" content="Listen to your music with Amadeus!" />
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
