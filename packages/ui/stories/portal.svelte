<script lang="ts">
  import {
    Checkbox,
    Gateway,
    Tooltip,
    Button,
    Portal,
    Group,
    Input,
    Realm,
    Stack,
  } from "@amadeus-music/ui";

  let value = "hello";
  let shown = true;
  let to = 0;
</script>

<Realm>
  Gateway 0: <Gateway name="0" />
  <Stack gap>
    {#if shown}
      <Portal to={to.toString()} unique="busy">
        <b id="glow" class="target:text-primary-600">Portal says {value}!</b>
      </Portal>
    {/if}
    <Checkbox bind:checked={shown}>Enabled</Checkbox>
    <Input bind:value resettable>Message:</Input>
    <Group size={4} bind:value={to}>
      <Button>Place 0</Button>
      <Button>Place 1</Button>
      <Button>Place 2</Button>
      <Button>Place 3</Button>
      <Tooltip>Choose destination for the portal</Tooltip>
    </Group>
  </Stack>
  Gateway 1: <Gateway name="1" /><br />
  Gateway 2: <Gateway name="2" /><br />
  Gateway 3: <Gateway name="3" />

  <Portal to="2" unique="busy">
    <b>Gateway 2 is busy!</b>
  </Portal>
</Realm>
