<script lang="ts">
  import { flipped, Gateway, Realm } from "../../component";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  onMount(() => {
    function fixState() {
      if (location.hash === $page.url.hash) return;
      goto(location.hash, { replaceState: true });
    }
    addEventListener("popstate", fixState);
    return () => removeEventListener("popstate", fixState);
  });
</script>

<Realm>
  <Gateway name="start" />
  <div class="flex h-full">
    <aside><Gateway name="left" /></aside>
    <div class="grow contain-layout">
      <slot />
      <footer
        class="fixed bottom-0 z-50 flex w-full touch-none flex-col-reverse items-center"
      >
        <Gateway name="bottom" />
      </footer>
    </div>
    <aside><Gateway name="right" /></aside>
  </div>
  <div class="pointer-events-none fixed inset-0 contain-strict">
    <Gateway name="overlay" />
  </div>
</Realm>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta
    name="viewport"
    content="width=device-width,height=device-height,initial-scale=1,user-scalable=no"
  />
  <meta
    name="theme-color"
    content="#{$flipped ? '000000' : 'ffffff'}"
    media="(prefers-color-scheme: light)"
  />
  <meta
    name="theme-color"
    content="#{$flipped ? 'ffffff' : '000000'}"
    media="(prefers-color-scheme: dark)"
  />
</svelte:head>
