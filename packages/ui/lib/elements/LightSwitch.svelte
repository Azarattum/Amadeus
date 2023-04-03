<script lang="ts">
  import { Checkbox, Portal } from "@amadeus-music/ui";

  const isStored = () => "localStorage" in globalThis && "dark" in localStorage;
  const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");

  export let preference = media?.matches;
  let checked = isStored() && (localStorage.dark === "true") !== preference;
  $: dark = !!(+preference ^ +checked);
  $: if ("localStorage" in globalThis && (flipped || isStored())) {
    localStorage.dark = dark;
  }

  export let flipped = checked;
  $: flipped = checked;
  export let theme = dark ? "dark" : "light";
  $: theme = dark ? "dark" : "light";

  media?.addEventListener("change", (e) => {
    if (e.matches !== preference) {
      if (isStored()) checked = !checked;
      preference = e.matches;
    }
  });
</script>

<Checkbox target="light-switch" iconLeft="sun" iconRight="moon" />
<Portal before unique="light-switch">
  <input class="hidden" type="checkbox" id="light-switch" bind:checked />
</Portal>
