<script lang="ts">
  import "$lib/tailwind.pcss";
</script>

<slot />

<style>
  :global(html, body) {
    height: 100%;
    width: 100%;
  }
</style>
