<script lang="ts">
  export let secondary = false;
  export let accent = false;
  export let sm = false;
</script>

<span
  class="[&>*]:align-bottom"
  class:text-content-200={secondary}
  class:font-medium={accent}
  class:text-sm={sm}
>
  <slot />
</span>
