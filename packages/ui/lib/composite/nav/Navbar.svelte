<script lang="ts">
  import { Separator, Stack } from "../../../component";
  import { tw } from "../../../internal/tailwind";

  let classes = "";
  export { classes as class };
</script>

<nav
  class={tw`flex h-12 w-full flex-col justify-between bg-surface-200 backdrop-blur-md ${classes}`}
>
  <Separator vertical={false} />
  <Stack x class="max-h-11 [&>*]:grow"><slot /></Stack>
</nav>
