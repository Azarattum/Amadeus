<script lang="ts">
  import { Header, Virtual } from "@amadeus-music/ui";
  import { autoscroll } from "../action";

  let items1 = Array.from({ length: 30 }).map((_, i) => i);
  let items2 = Array.from({ length: 30 }).map((_, i) => 30 + i);
</script>

<div class="flex h-full gap-8">
  <div
    class="scroll flex h-full w-1/2 transform-gpu flex-col gap-4 overflow-y-scroll scroll-smooth p-4"
  >
    <Header>List 1</Header>
    <Virtual
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
    </Virtual>
  </div>
  <div
    use:autoscroll
    class="scroll flex h-full w-1/2 transform-gpu flex-col gap-4 overflow-y-scroll scroll-smooth p-4"
  >
    <Header>List 2</Header>
    <Virtual
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
    </Virtual>
  </div>
</div>
