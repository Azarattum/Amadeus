<script lang="ts">
  import {
    Checkbox,
    Button,
    VStack,
    HStack,
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
    <Button air><Icon name="artists" />Air Button</Button>
    <Button><Icon name="sun" /></Button>
    <Button><Icon name="sun" />Button showcase!</Button>
    <Button primary round><Icon name="search" /></Button>
    <Button primary><Icon name="moon" /></Button>
    <Button primary>CLICK ME</Button>
  </HStack>
</VStack>
