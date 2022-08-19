<script lang="ts">
  import { Button, Portal } from "@amadeus/ui";

  let toggle = false;
</script>

{#if toggle}
  <Portal>Hello from the other side!</Portal>
{/if}

<Button on:click={() => (toggle = !toggle)}>Toggle Portal</Button>
