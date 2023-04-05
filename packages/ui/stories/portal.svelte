<script>
  import { Checkbox, Input, Gateway, Portal, Stack } from "@amadeus-music/ui";

  let value = "hello";
  let shown = true;
  let before = false;
</script>

<Gateway>
  <Stack>
    {#if shown}
      <Portal {before}>
        <b>Portal says {value}!</b>
      </Portal>
    {/if}
    <Checkbox bind:checked={shown} label="Show Portal" />
    <Checkbox bind:checked={before} label="Is Before" />
    <Input bind:value />
  </Stack>
</Gateway>
