<script lang="ts">
  import {
    Checkbox,
    Tooltip,
    Button,
    Stack,
    Group,
    Input,
    Icon,
  } from "@amadeus-music/ui";
</script>

<Stack class="gap-2">
  <Checkbox><Icon of="sun" /><Icon of="moon" slot="after" /></Checkbox>
  <Checkbox>
    Search?
    <Icon of="search" />
    <Tooltip>Not really...</Tooltip>
  </Checkbox>
  <Input placeholder="Just Input"><Tooltip>This is an input!</Tooltip></Input>
  <Input resettable placeholder="Search"><Icon of="search" /></Input>
  <Stack x class="gap-2">
    <Button><Icon of="sun" /></Button>
    <Button primary><Icon of="moon" /></Button>
    <Button primary round><Icon of="search" /></Button>
    <Button primary>Primary Button</Button>
    <Button><Icon of="sun" />Button With Icon</Button>
    <Button air><Icon of="people" />Air Button</Button>
    <Button compact air><Icon of="moon" md />Moon</Button>
    <Button compact air><Icon of="sun" md />Sun</Button>
  </Stack>
  <Stack x class="gap-2">
    <Group value={1} size={4}>
      <Button><Icon of="last" /></Button>
      <Button><Icon of="history" /></Button>
      <Button><Icon of="stars" /></Button>
      <Button><Icon of="people" /></Button>
    </Group>
    <Group size={2}>
      <Button><Icon of="list" /><Tooltip>Queue</Tooltip></Button>
      <Button><Icon of="book" /><Tooltip>Lyrics</Tooltip></Button>
    </Group>
    <Group value={2} size={3}>
      <Button><Icon of="note" />Tracks</Button>
      <Button><Icon of="people" />Artists</Button>
      <Button><Icon of="disk" />Albums</Button>
    </Group>
  </Stack>
</Stack>
