<script>
  import { Swipeable, Stack, Icon, Card, Text } from "@amadeus-music/ui";
</script>

<Stack class="p-4">
  <Swipeable>
    <Icon name="sun" slot="before" />
    <Card interactive sm flat>
      <Text accent>Hello</Text>
      <Text secondary sm>Adele</Text>
      <div
        slot="before"
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-green-500 to-lime-500 shadow-lg"
      />
    </Card>
    <Icon name="moon" slot="after" />
  </Swipeable>
</Stack>
