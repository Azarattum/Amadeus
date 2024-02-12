<script lang="ts">
  import type { CollectionType, Collection } from "@amadeus-music/protocol";
  import { type EditEvent, Virtual, Icon } from "@amadeus-music/ui";
  import { createEventDispatcher } from "svelte";
  import Unit from "./internal/Unit.svelte";
  import { match } from "$lib/util";
  import { ready } from "$lib/data";

  const dispatch = createEventDispatcher<{
    rearrange: { after: number | undefined; id: number };
    create: void;
  }>();

  export let of: (Collection | undefined)[] | undefined = undefined;
  export let aliases: Record<string, string> = {};
  export let style: CollectionType;
  export let expandable = false;
  export let href = "/library";
  export let editable = false;
  export let prerender = 3;
  export let filter = "";

  function edit({ detail }: EditEvent<Collection | undefined | null>) {
    if (!detail.item || detail.action !== "rearrange") return;
    dispatch("rearrange", { after: detail.after?.id, id: detail.item.id });
  }

  $: items =
    of && ready(of)
      ? (expandable ? [...of, null] : of).filter(match(filter))
      : Array.from<undefined>({ length: prerender });
</script>

<Virtual
  animate
  sortable={editable && !filter}
  key={(x) => x?.id}
  columns="20rem"
  {prerender}
  gap={16}
  {items}
  on:edit={edit}
  let:item
  on:end
>
  {#if item}
    <Unit
      href="{href}/{aliases[item.id] || `${style}#${item.id}`}"
      {...{ [style]: item }}
    />
  {:else if item === null}
    <button
      class="p flex w-full cursor-pointer justify-center rounded-2xl p-4 text-highlight ring-4 ring-inset ring-highlight focus-visible:outline-none focus-visible:ring-primary-600"
      on:click={() => dispatch("create")}
    >
      <Icon of="plus" xxl />
    </button>
  {:else}
    <Unit {...{ [style]: true }} />
  {/if}
</Virtual>
