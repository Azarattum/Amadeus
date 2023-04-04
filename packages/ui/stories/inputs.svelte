<script lang="ts">
  import {
    Checkbox,
    Button,
    VStack,
    HStack,
    Group,
    Input,
    Icon,
  } from "@amadeus-music/ui";
</script>

<VStack gap>
  <Checkbox iconLeft="sun" iconRight="moon" />
  <Checkbox label="Search?" iconLeft="search" />
  <Input label="Just Input" />
  <Input icon="search" label="Search" />
  <HStack gap>
    <Button><Icon name="sun" /></Button>
    <Button primary><Icon name="moon" /></Button>
    <Button primary round><Icon name="search" /></Button>
    <Button primary>Primary Button</Button>
    <Button><Icon name="sun" />Button With Icon</Button>
    <Button air><Icon name="artists" />Air Button</Button>
    <Button compact air stretch><Icon md name="moon" />Moon</Button>
    <Button compact air stretch><Icon md name="sun" />Sun</Button>
  </HStack>
  <HStack gap>
    <Group size={2}>
      <Button><Icon name="moon" /></Button>
      <Button><Icon name="sun" /></Button>
    </Group>
    <Group size={4} value={1}>
      <Button><Icon name="artists" /></Button>
      <Button><Icon name="sun" /></Button>
      <Button><Icon name="search" /></Button>
      <Button><Icon name="book" /></Button>
    </Group>
    <Group size={3} value={2}>
      <Button><Icon name="artists" />Artists</Button>
      <Button><Icon name="sun" />Sun</Button>
      <Button><Icon name="search" />Search</Button>
    </Group>
  </HStack>
</VStack>
