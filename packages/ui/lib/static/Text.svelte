<script lang="ts">
  export let secondary = false;
  export let accent = false;
  export let indent = false;
  export let sm = false;
</script>

<span
  class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-left [&>*]:align-bottom"
  class:text-content-200={secondary}
  class:font-medium={accent}
  class:indent-4={indent}
  class:text-sm={sm}
>
  <slot />
</span>
