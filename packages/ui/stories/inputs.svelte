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

<Stack gap>
  <Checkbox><Icon name="sun" /><Icon name="moon" slot="after" /></Checkbox>
  <Checkbox>
    Search?
    <Icon name="search" />
    <Tooltip>Not really...</Tooltip>
  </Checkbox>
  <Input placeholder="Just Input"><Tooltip>This is an input!</Tooltip></Input>
  <Input placeholder="Search"><Icon name="search" /></Input>
  <Stack x gap>
    <Button><Icon name="sun" /></Button>
    <Button primary><Icon name="moon" /></Button>
    <Button primary round><Icon name="search" /></Button>
    <Button primary>Primary Button</Button>
    <Button><Icon name="sun" />Button With Icon</Button>
    <Button air><Icon name="artists" />Air Button</Button>
    <Button compact air><Icon md name="moon" />Moon</Button>
    <Button compact air><Icon md name="sun" />Sun</Button>
  </Stack>
  <Stack x gap>
    <Group size={4} value={1}>
      <Button><Icon name="last" /></Button>
      <Button><Icon name="history" /></Button>
      <Button><Icon name="stars" /></Button>
      <Button><Icon name="artists" /></Button>
    </Group>
    <Group size={2}>
      <Button><Icon name="queue" /><Tooltip>Queue</Tooltip></Button>
      <Button><Icon name="book" /><Tooltip>Lyrics</Tooltip></Button>
    </Group>
    <Group size={3} value={2}>
      <Button><Icon name="note" />Tracks</Button>
      <Button><Icon name="artists" />Artists</Button>
      <Button><Icon name="album" />Albums</Button>
    </Group>
  </Stack>
</Stack>
