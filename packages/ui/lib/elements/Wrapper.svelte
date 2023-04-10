<script>
  import Gateway from "../layout/Gateway.svelte";
  import Realm from "../layout/Realm.svelte";
</script>

<Realm>
  <Gateway name="start" />
  <slot />
  <div class="fixed bottom-0 z-50 flex w-full flex-col-reverse">
    <Gateway name="bottom" />
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
    content="#ffffff"
    media="(prefers-color-scheme: light)"
  />
  <meta
    name="theme-color"
    content="#000000"
    media="(prefers-color-scheme: dark)"
  />
</svelte:head>
