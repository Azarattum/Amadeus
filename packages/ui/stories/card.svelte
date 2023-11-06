<script lang="ts">
  import { Header, Stack, Icon, Text, Card, When } from "@amadeus-music/ui";
</script>

<Stack class="h-full gap-8 p-4">
  <Header xl>Cards</Header>
  <Stack x class="grow-0 gap-4">
    <Card interactive>
      <Header center>Epic Music</Header>
      <Stack x class="gap-4">
        <Text secondary><Icon of="note" sm /> 754</Text>
        <Text secondary><Icon of="clock" sm /> 32:14</Text>
      </Stack>
      <div
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
        slot="after"
      />
    </Card>
    <Card interactive>
      <Header center>Calm Music</Header>
      <Stack x class="gap-4">
        <Text secondary><Icon of="note" sm /> 754</Text>
        <Text secondary><Icon of="clock" sm /> 32:14</Text>
      </Stack>
      <div
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg"
        slot="after"
      />
    </Card>
    <Card interactive>
      <Header center>Energy Music</Header>
      <Stack x class="gap-4">
        <Text secondary><Icon of="note" sm /> 754</Text>
        <Text secondary><Icon of="clock" sm /> 32:14</Text>
      </Stack>
      <div
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
        slot="after"
      />
    </Card>
  </Stack>

  <Stack>
    <When lg>
      <Card flat flow xs>
        <div class="w-[48px]" slot="before" />
        <Header sm>Title</Header>
        <Header sm>Artist</Header>
        <Header sm>Album</Header>
      </Card>
    </When>
    <Card interactive flat flow sm>
      <Text accent>Rockstar</Text>
      <Text secondary sm>Nickelback</Text>
      <When lg><Text secondary>Rockstar</Text></When>
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg"
        slot="before"
      />
    </Card>
    <Card interactive flat flow sm>
      <Text accent>Hello</Text>
      <Text secondary sm>Adele</Text>
      <When lg><Text secondary sm>25</Text></When>
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-green-500 to-lime-500 shadow-lg"
        slot="before"
      />
    </Card>
    <Card interactive flat flow sm>
      <Text accent>Coming for You</Text>
      <Text secondary sm>Nicole Abeth</Text>
      <When lg><Text secondary sm>Coming for You</Text></When>
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg"
        slot="before"
      />
    </Card>
  </Stack>
</Stack>
