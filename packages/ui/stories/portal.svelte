<script>
  import { Checkbox, Input, Gateway, Portal, VStack } from "@amadeus-music/ui";

  let value = "hello";
  let shown = true;
  let before = false;
</script>

<Gateway>
  <VStack>
    {#if shown}
      <Portal {before}>
        <b>Portal says {value}!</b>
      </Portal>
    {/if}
    <Checkbox bind:checked={shown} label="Show Portal" />
    <Checkbox bind:checked={before} label="Is Before" />
    <Input bind:value />
  </VStack>
</Gateway>
