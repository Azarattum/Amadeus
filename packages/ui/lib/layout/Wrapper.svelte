<script lang="ts">
  import { flipped, Gateway, Realm } from "../../component";
</script>

<Realm>
  <Gateway name="start" />
  <slot />
  <div class="fixed bottom-0 z-50 flex w-full flex-col-reverse">
    <Gateway name="bottom" />
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
