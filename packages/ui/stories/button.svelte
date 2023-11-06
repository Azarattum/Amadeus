<script lang="ts">
  import { Checkbox, Button, Stack, Icon } from "@amadeus-music/ui";

  const props: Record<string, boolean> = {
    primary: false,
    compact: false,
    round: false,
    slim: false,
    air: false,
  };
</script>

<Stack class="gap-2">
  <Stack x class="gap-2">
    {#each Object.keys(props) as prop}
      <Checkbox bind:checked={props[prop]}>{prop}</Checkbox>
    {/each}
  </Stack>
  <Stack x class="gap-2">
    <Button {...props}><Icon of="book" />Button With Icon</Button>
    <Button {...props}>Just A Button</Button>
    <Button {...props}><Icon of="last" /></Button>
  </Stack>
</Stack>
