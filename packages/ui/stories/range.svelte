<script lang="ts">
  import { Checkbox, Input, Range, Stack } from "@amadeus-music/ui";

  let min = 0 as any;
  let max = 100 as any;
  let p = false;
  let hints = false;
  let controls = false;
</script>

<Stack gap grow>
  <Stack x gap>
    <Input bind:value={min}>Min:</Input>
    <Input bind:value={max}>Max:</Input>
    <Checkbox bind:checked={hints}>Hints</Checkbox>
    <Checkbox bind:checked={controls}>Controls</Checkbox>
    <Checkbox bind:checked={p}>Padding</Checkbox>
  </Stack>
  <Range {min} {max} {hints} {controls} {p} />
</Stack>
