<script lang="ts">
  import { List, Text, When, Icon, Header, Button } from "@amadeus-music/ui";

  const items = [
    "Hello",
    "Test",
    "Hi",
    "Something",
    "Item",
    "Song",
    "Kek",
    "Hello2",
    "Test2",
    "Hi2",
    "Something2",
    "Item2",
    "Song2",
    "Kek2",
  ];
</script>

<div class="h-screen overflow-y-scroll">
  <When lg>
    <div
      class="sticky top-0 z-50 grid auto-cols-fr grid-flow-col border-b border-b-highlight bg-surface-200 pl-20 pr-16 backdrop-blur-lg"
    >
      <Header sm>Title</Header>
      <Header sm>Artist</Header>
      <Header sm>Album</Header>
    </div>
  </When>
  <List {items} let:item let:index>
    <div
      slot="before"
      class="h-[48px] w-[48px] rounded bg-gradient-to-r from-green-500 to-lime-500 shadow-lg"
      style="filter: hue-rotate({Math.sin(index) * 360}deg)"
    />
    <Text accent>{item}</Text>
    <Text secondary sm>{item}</Text>
    <When lg><Text secondary sm>{item}</Text></When>
    <Text secondary sm slot="after">1:42</Text>
    <Icon name="last" slot="action" />
    <svelte:fragment slot="panel">
      <Button air stretch><Icon name="next" /></Button>
      <Button air stretch><Icon name="last" /></Button>
    </svelte:fragment>
  </List>
</div>
