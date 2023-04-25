<script lang="ts">
  import { Header, Overlay } from "@amadeus-music/ui";
  import Virtual2 from "$lib/layout/Virtual2.svelte";

  let items1 = Array.from({ length: 30 }).map((_, i) => i);
  let items2 = Array.from({ length: 30 }).map((_, i) => 30 + i);
</script>

<Overlay />
<div class="flex h-full gap-8">
  <div
    class="scroll flex h-full w-1/2 transform-gpu flex-col gap-4 overflow-y-scroll scroll-smooth p-4"
  >
    <Header>List 1</Header>
    <Virtual2
      items={items1}
      let:item
      let:index
      animate
      columns="7rem"
      sortable="a"
    >
      <p
        class:shadow-lg={Number.isNaN(index)}
        class="flex h-11 items-center justify-center border border-highlight bg-surface"
      >
        {item}
      </p>
    </Virtual2>
  </div>
  <div
    class="scroll flex h-full w-1/2 transform-gpu flex-col gap-4 overflow-y-scroll scroll-smooth p-4"
  >
    <Header>List 2</Header>
    <Virtual2
      items={items2}
      let:item
      let:index
      animate
      columns="20rem"
      sortable="a"
    >
      <p
        class:shadow-lg={Number.isNaN(index)}
        class="flex h-20 items-center justify-center border border-highlight bg-surface"
      >
        {item}
      </p>
    </Virtual2>
  </div>
</div>
