<script lang="ts">
  import { Card, Icon, Swipeable } from "../../component";
  import { createEventDispatcher } from "svelte";
  type T = $$Generic;

  export let items: T[];
  export let key = <R>(x: T) => x as any as R;
  export let selected = new Set<ReturnType<typeof key>>();

  const dispatch = createEventDispatcher<{ click: T; action: T }>();

  function select(id: ReturnType<typeof key>) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    selected = selected;
  }
</script>

{#each items as item, i (key(item))}
  {@const id = key(item)}
  <div class="[&_hr]:!opacity-100 [&_hr]:last-of-type:!opacity-0">
    <Swipeable
      on:after={() => select(id)}
      on:before={() => dispatch("action", item)}
    >
      <Card
        sm
        flat
        flow
        interactive
        on:contextmenu={(e) => (e.preventDefault(), select(id))}
        on:click={() => (selected.size ? select(id) : dispatch("click", item))}
      >
        <div
          class="pointer-events-none absolute inset-0 -z-50 bg-primary-200/30 opacity-0 transition-opacity"
          class:opacity-100={selected.has(id)}
        />
        <slot {item} index={i} />
        <slot name="before" slot="before" />
        <div
          slot="after"
          class="grid text-primary-600 [&>*]:col-start-1 [&>*]:row-start-1"
        >
          <div
            class="opacity-0 transition-opacity"
            class:opacity-100={!selected.size}
          >
            <slot name="after" />
          </div>
          <div
            class="opacity-0 transition-opacity"
            class:opacity-100={selected.size}
          >
            <Icon name="circle" />
          </div>
          <div
            class="scale-0 transition-transform"
            class:scale-100={selected.has(id)}
          >
            <Icon name="target" />
          </div>
        </div>
      </Card>
      <slot name="action" slot="before" />
      <Icon name="list" slot="after" />
    </Swipeable>
  </div>
{/each}
