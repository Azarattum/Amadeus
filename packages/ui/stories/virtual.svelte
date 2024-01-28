<script lang="ts">
  import { Virtual, Header } from "@amadeus-music/ui";
  import { autoscroll } from "../action";

  let items1 = Array.from({ length: 30 }).map((_, i) => i);
  let items2 = Array.from({ length: 300 }).map((_, i) => 30 + i);
</script>

<div class="flex h-dvh gap-8">
  <div
    class="scroll flex h-full w-1/2 transform-gpu flex-col gap-4 overflow-y-scroll p-4"
  >
    <Header>List 1</Header>
    <Virtual
      animate
      items={items1}
      columns="7rem"
      sortable="a"
      let:index
      let:item
    >
      <p
        class="flex h-11 items-center justify-center border border-highlight bg-surface"
        class:shadow-lg={Number.isNaN(index)}
      >
        {item}
      </p>
    </Virtual>
  </div>
  <div
    class="scroll flex h-full w-1/2 transform-gpu flex-col gap-4 overflow-y-scroll p-4"
    use:autoscroll
  >
    <Header>List 2</Header>
    <Virtual
      animate
      columns="20rem"
      items={items2}
      sortable="a"
      let:index
      let:item
    >
      <p
        class="flex h-20 items-center justify-center border border-highlight bg-surface"
        class:shadow-lg={Number.isNaN(index)}
      >
        {item}
      </p>
    </Virtual>
  </div>
</div>
