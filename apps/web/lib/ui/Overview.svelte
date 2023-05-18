<script lang="ts">
  import type { Collection, CollectionType } from "@amadeus-music/protocol";
  import { Icon, Virtual, type EditEvent } from "@amadeus-music/ui";
  import { createEventDispatcher } from "svelte";
  import Card from "$lib/ui/Card.svelte";
  import { match } from "$lib/util";
  import { ready } from "$lib/data";

  const dispatch = createEventDispatcher<{
    rearrange: { id: number; after: number | undefined };
    create: void;
  }>();

  export let of: (Collection | undefined)[] | undefined = undefined;
  export let style: CollectionType;
  export let expandable = false;
  export let href = "/library";
  export let editable = false;
  export let prerender = 3;
  export let filter = "";

  function edit({ detail }: EditEvent<Collection | undefined | null>) {
    if (!detail.item || detail.action !== "rearrange") return;
    dispatch("rearrange", { id: detail.item.id, after: detail.after?.id });
  }

  $: items =
    of && ready(of)
      ? (expandable ? [...of, null] : of).filter(match(filter))
      : Array.from<undefined>({ length: prerender });
</script>

<Virtual
  sortable={editable && !!filter}
  key={(x) => x?.id}
  columns="20rem"
  on:edit={edit}
  {prerender}
  let:item
  gap={16}
  animate
  {items}
  on:end
>
  {#if item}
    <Card href="{href}/{style}#{item.id}" {...{ [style]: { item } }} />
  {:else if item === null}
    <button
      class="p flex w-full cursor-pointer justify-center rounded-2xl p-4 text-highlight ring-4 ring-inset ring-highlight"
      on:click={() => dispatch("create")}
    >
      <Icon name="plus" xxl />
    </button>
  {:else}
    <Card {...{ [style]: true }} />
  {/if}
</Virtual>
