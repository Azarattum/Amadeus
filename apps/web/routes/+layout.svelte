<script lang="ts">
  import { sql } from "@amadeus-music/crdata";
  import { base } from "$app/paths";
  import { onMount } from "svelte";
  import "@amadeus-music/ui";

  const splashes = [
    [320, 568, 2, "5"],
    [375, 667, 2, "8"],
    [375, 812, 3, "x"],
    [414, 736, 3, "plus"],
  ];

  onMount(async () => {
    // Utilities to inspect the database during development
    if (import.meta.env.DEV) {
      const { update } = await import("$lib/data");
      (globalThis as any).db = {
        exec: (query: any) =>
          update((db) =>
            sql
              .raw(query)
              .execute(db)
              .then((x) => x.rows),
          ),
        show: (table: any) =>
          update((db) => db.selectFrom(table).selectAll().execute()),
      };
    }
  });
</script>

<svelte:head>
  <meta content="Listen to your music with Amadeus!" name="description" />
  <link href="{base}/images/logo-180.webp" rel="apple-touch-icon" />
  <link href="{base}/manifest.json" rel="manifest" />
  {#each splashes as [w, h, r, image]}
    <link
      media="(device-width: {w}px) and (device-height: {h}px) and (-webkit-device-pixel-ratio: {r})"
      href="{base}/images/splash-{image}.webp"
      rel="apple-touch-startup-image"
    />
  {/each}
</svelte:head>

<slot />
