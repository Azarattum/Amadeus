<script lang="ts">
  import { Virtual, Image, Card, Text } from "@amadeus-music/ui";

  const items = Array.from({ length: 300 }).map(() => ({
    subtitle: Math.random().toString(36).slice(2),
    title: Math.random().toString(36).slice(2),
    thumbnail: null,
  }));
</script>

<div
  class="flex h-full w-full transform-gpu flex-col gap-4 overflow-y-scroll p-4"
>
  <Virtual
    animate
    sortable="a"
    {items}
    on:end={() => console.log("end!")}
    let:item
  >
    <Card>
      <Image src={item.thumbnail} class="rounded" slot="before">
        <div
          class="flex size-full items-center justify-center bg-gradient-to-r from-rose-400 to-red-400 text-white"
        />
      </Image>
      <Text accent>
        {item.title}
      </Text>
      <Text secondary sm>{item.subtitle}</Text>
    </Card>
  </Virtual>
</div>
