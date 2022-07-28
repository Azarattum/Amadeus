<script lang="ts">
  import { delay } from "$lib/util/throttle";
  import { Virtual } from "$lib/layout";
  import { onMount } from "svelte";

  let items = Array.from({ length: 30 }).map((_, i) => i);

  let list: HTMLElement;
  onMount(async () => {
    await delay(100);
    list.scrollBy(0, 64 * 10);
    await delay(1000);
    [items[10], items[14]] = [items[14], items[10]];
    await delay(2500);
    [items[10], items[11]] = [items[11], items[10]];
    await delay(1000);
    list.scrollBy(0, 64 * 1);
  });
</script>

<!-- "webkit-overflow-scrolling" Bug fix for iOS safari hiding scroll underneath the content -->
<div
  bind:this={list}
  class="scroll h-full w-auto overflow-y-scroll scroll-smooth rounded-md"
  style="-webkit-overflow-scrolling: touch"
>
  <Virtual {items} let:item animation={5000}>
    <p class="mt-8 h-8 rounded bg-pink-300 shadow-md shadow-black/30">{item}</p>
  </Virtual>
</div>
