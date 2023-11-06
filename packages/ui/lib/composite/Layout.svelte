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
  <Gateway for="root" />
  <div class="flex h-[100dvh] max-h-[100dvh] w-[100dvw] max-w-[100dvw]">
    <aside>
      <slot name="panel-left" />
    </aside>
    <div class="flex grow flex-col contain-strict">
      <header>
        <slot name="panel-top" />
      </header>
      <main class="relative h-full w-full">
        <slot />
      </main>
      <footer
        class="fixed bottom-0 z-50 flex w-full touch-none flex-col-reverse items-center"
      >
        <slot name="panel-bottom" />
        <Gateway for="panel" />
      </footer>
    </div>
    <aside>
      <slot name="panel-right" />
    </aside>
    <div class="pointer-events-none fixed inset-0 contain-strict">
      <Gateway for="overlay" />
    </div>
  </div>
</Realm>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta
    content="width=device-width,height=device-height,initial-scale=1,user-scalable=no"
    name="viewport"
  />
  <meta
    content="#{$flipped ? '000000' : 'ffffff'}"
    media="(prefers-color-scheme: light)"
    name="theme-color"
  />
  <meta
    content="#{$flipped ? 'ffffff' : '000000'}"
    media="(prefers-color-scheme: dark)"
    name="theme-color"
  />
</svelte:head>
