<script>
  export let primary = false;
  export let stretch = false;
  export let round = false;
  export let target = true;
  export let air = false;
  export let href = "";

  const tag = href ? "a" : "button";
  const id = href && target ? href.split("#").pop() : false;
</script>

<svelte:element
  this={tag}
  {href}
  {id}
  on:click
  class="transition-composite relative flex h-11 items-center gap-[0.625rem] text-content-100 outline-2 outline-offset-2 outline-primary-600 after:absolute after:right-2 after:h-6 after:w-0.5 after:rounded-full after:bg-primary-600 after:opacity-0 after:transition-opacity focus-visible:outline active:scale-95 {round
    ? 'rounded-full'
    : 'rounded-lg'}"
  class:w-full={stretch}
  class:hover:text-content={!primary}
  class:bg-highlight={!primary}
  class:hover:bg-highlight-100={!primary}
  class:bg-primary-600={primary}
  class:hover:bg-primary-700={primary}
  class:text-white={primary}
  class:px-[0.625rem]={!air}
  class:bg-transparent={air}
  class:text-content-200={air}
  class:hover:bg-transparent={air}
  class:target:text-primary-600={air}
  class:target:after:opacity-100={air}
  class:target:hover:text-primary-700={air}
>
  <slot />
</svelte:element>
