<script lang="ts">
  import Virtual2 from "$lib/layout/Virtual2.svelte";

  let items = Array.from({ length: 300 }).map((_, i) => i);
</script>

<div class="scroll h-full transform-gpu overflow-y-scroll scroll-smooth">
  <Virtual2 {items} let:item let:index>
    <p class="h-11 border border-highlight">{index}: {item}</p>
  </Virtual2>
</div>
