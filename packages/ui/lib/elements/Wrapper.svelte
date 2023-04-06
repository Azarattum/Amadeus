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
