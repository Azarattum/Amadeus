<script lang="ts" context="module">
  import { writable } from "svelte/store";
  export const flipped = writable(false);
</script>

<script lang="ts">
  import { Checkbox, Portal, Icon } from "../../component";
  import { onMount, tick } from "svelte";

  const isStored = () => "localStorage" in globalThis && "dark" in localStorage;
  const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");

  export let preference = media?.matches;
  let checked = isStored() && (localStorage.dark === "true") !== preference;
  $: dark = !!(+preference ^ +checked);
  $: if ("localStorage" in globalThis && (checked || isStored())) {
    localStorage.dark = dark;
  }

  export let theme = dark ? "dark" : "light";
  $: theme = dark ? "dark" : "light";
  $: $flipped = checked;

  media?.addEventListener("change", (e) => {
    if (e.matches !== preference) {
      if (isStored()) checked = !checked;
      preference = e.matches;
    }
  });

  onMount(() => {
    const update = (e: Event) => (checked = (e.target as any)?.checked);
    tick().then(() => {
      const lightSwitch = document.getElementById("light-switch");
      if (!lightSwitch) return;
      (lightSwitch as any).checked = checked;
      lightSwitch.addEventListener("change", update);
    });
    return () =>
      document
        .getElementById("light-switch")
        ?.removeEventListener("change", update);
  });
</script>

<Checkbox target="light-switch">
  <Icon name="sun" />
  <Icon name="moon" slot="after" />
</Checkbox>
<Portal to="start" unique="light-switch">
  <input class="absolute appearance-none" id="light-switch" type="checkbox" />
</Portal>
