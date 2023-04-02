<script context="module" lang="ts">
  if (!import.meta.env.SSR) {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
</script>

<script lang="ts">
  import Checkbox from "../primitive/Checkbox.svelte";
  import Portal from "$lib/layout/Portal.svelte";
  import { onMount } from "svelte";

  let dark = false;
  onMount(() => (dark = matchMedia("(prefers-color-scheme: dark)")?.matches));
  $: if (!import.meta.env.SSR) {
    localStorage.theme = dark ? "dark" : "light";
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
</script>

<Portal prepend>
  <input type="checkbox" class="hidden" id="light-switch" />
</Portal>

<Checkbox
  input="light-switch"
  iconLeft="sun"
  iconRight="moon"
  bind:checked={dark}
/>
