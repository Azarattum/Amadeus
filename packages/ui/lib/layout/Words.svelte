<script lang="ts">
  export let from: string | undefined;
</script>

{#if from}
  {#each from.split(" ").filter((x) => x) as word}
    <span style="line-height: 100%;" class="inline-block">{word}</span>{" "}
  {/each}
{/if}
