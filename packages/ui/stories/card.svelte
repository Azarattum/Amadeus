<script lang="ts">
  import { Icon, Stack, Text, Card, Header } from "@amadeus-music/ui";
</script>

<Stack p grow gap="xl">
  <Header xl>Cards</Header>
  <Stack x gap="lg" wrap>
    <Card interactive>
      <Header>Epic Music</Header>
      <Stack x gap="lg">
        <Text secondary><Icon name="note" sm /> 754</Text>
        <Text secondary><Icon name="clock" sm /> 32:14</Text>
      </Stack>
      <div
        slot="after"
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
      />
    </Card>
    <Card interactive>
      <Header>Calm Music</Header>
      <Stack x gap="lg">
        <Text secondary><Icon name="note" sm /> 754</Text>
        <Text secondary><Icon name="clock" sm /> 32:14</Text>
      </Stack>
      <div
        slot="after"
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg"
      />
    </Card>
    <Card interactive>
      <Header>Energy Music</Header>
      <Stack x gap="lg">
        <Text secondary><Icon name="note" sm /> 754</Text>
        <Text secondary><Icon name="clock" sm /> 32:14</Text>
      </Stack>
      <div
        slot="after"
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
      />
    </Card>
  </Stack>

  <Stack grow>
    <Card interactive sm flat>
      <Stack gap="xs">
        <Text accent>Rockstar</Text>
        <Text secondary sm>Nickelback</Text>
      </Stack>
      <div
        slot="before"
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg"
      />
      <Icon slot="after" name="sun" />
    </Card>
    <Card interactive sm flat>
      <Stack gap="xs">
        <Text accent>Hello</Text>
        <Text secondary sm>Adele</Text>
      </Stack>
      <div
        slot="before"
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-green-500 to-lime-500 shadow-lg"
      />
      <Text slot="after" secondary>3:42</Text>
    </Card>
    <Card interactive sm flat>
      <Stack gap="xs">
        <Text accent>Coming for You</Text>
        <Text secondary sm>Nicole Abeth</Text>
      </Stack>
      <div
        slot="before"
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg"
      />
      <div
        slot="after"
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-violet-500 to-blue-500 shadow-lg"
      />
    </Card>
  </Stack>
</Stack>
