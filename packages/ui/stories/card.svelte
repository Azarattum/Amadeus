<script lang="ts">
  import { Header, Stack, Icon, Text, Card } from "@amadeus-music/ui";
  let selected: boolean[] = [];
</script>

<Stack class="h-full gap-8 p-4">
  <Header xl>Cards</Header>
  <Stack x class="grow-0 gap-4">
    <Card big>
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
    <Card big>
      <Header center>
        This playlist has unexpectedly extremely long title
      </Header>
      <Stack x class="gap-4">
        <Text secondary><Icon of="note" sm /> 754</Text>
        <Text secondary><Icon of="clock" sm /> 32:14</Text>
      </Stack>
      <div
        class="h-[104px] w-[104px] rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg"
        slot="after"
      />
    </Card>
    <Card big>
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
    <div
      class="sticky top-11 z-10 hidden auto-cols-fr grid-flow-col border-b border-b-highlight bg-surface/70 pl-20 pr-4 backdrop-blur-md lg:grid"
    >
      <Header sm>Title</Header>
      <Header sm>Artist</Header>
      <Header sm>Album</Header>
    </div>
    <Card selected={selected[0]} on:click={() => (selected[0] = !selected[0])}>
      <Text accent>Rockstar</Text>
      <Text secondary sm>Nickelback</Text>
      <Text secondary class="hidden lg:inline">Rockstar</Text>
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg"
        slot="before"
      />
    </Card>
    <Card selected={selected[1]} on:click={() => (selected[1] = !selected[1])}>
      <Text accent>Hello</Text>
      <Text secondary sm>Adele</Text>
      <Text secondary sm class="hidden lg:inline">25</Text>
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-green-500 to-lime-500 shadow-lg"
        slot="before"
      />
    </Card>
    <Card selected={selected[2]} on:click={() => (selected[2] = !selected[2])}>
      <Text accent
        >The title of this song is no long, that it could't be displayed</Text
      >
      <Text secondary sm
        >Well artist could also have a very long name. A very long name!</Text
      >
      <Text secondary sm class="hidden lg:inline"
        >Really? Long playlist title as well? Yeah! Why not? Playlists are cool
        too!</Text
      >
      <div
        class="h-[48px] w-[48px] rounded bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg"
        slot="before"
      />
    </Card>
  </Stack>
</Stack>
