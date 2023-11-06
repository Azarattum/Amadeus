<script>
  import { Swipeable, Stack, Icon, Card, Text } from "@amadeus-music/ui";
</script>

<Stack class="p-4">
  <Swipeable>
    <Icon of="sun" slot="before" />
    <Card interactive flat sm>
      <Text accent>Hello</Text>
      <Text secondary sm>Adele</Text>
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-green-500 to-lime-500 shadow-lg"
        slot="before"
      />
    </Card>
    <Icon of="moon" slot="after" />
  </Swipeable>
</Stack>
