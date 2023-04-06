<script>
  import Gateway from "../layout/Gateway.svelte";
  import Realm from "../layout/Realm.svelte";
</script>

<Realm>
  <Gateway name="start" />
  <slot />
</Realm>
