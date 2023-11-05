<script lang="ts">
  import { Button, Checkbox, Icon, Stack } from "@amadeus-music/ui";

  const props: Record<string, boolean> = {
    primary: false,
    compact: false,
    stretch: false,
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
    <Button {...props}><Icon name="book" />Button With Icon</Button>
    <Button {...props}>Just A Button</Button>
    <Button {...props}><Icon name="last" /></Button>
  </Stack>
</Stack>
