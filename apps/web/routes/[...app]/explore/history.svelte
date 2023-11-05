<script lang="ts">
  import {
    Button,
    Header,
    Icon,
    Separator,
    Spacer,
    Stack,
  } from "@amadeus-music/ui";
  import { history } from "$lib/data";

  export let type = "tracks";
</script>

{#if $history.length}
  <div class="m-auto max-w-xl p-8 [&>*:first-child]:opacity-50">
    <Stack x class="place-items-baseline">
      <Header center sm>History</Header>
      <Spacer />
      <Button air on:click={() => history.clear()}>
        <Icon name="trash" />
      </Button>
    </Stack>
    <Separator />
    {#each $history.slice(0, 6) as entry}
      <Button air stretch href="#{type}/{entry.query}">{entry.query}</Button>
    {/each}
  </div>
{/if}
