<script>
  import {
    LightSwitch,
    Sidenav,
    Layout,
    Navbar,
    Input,
    Icon,
  } from "@amadeus-music/ui";
  import Player from "./Player.svelte";
  import { search } from "$lib/data";
</script>

<Layout>
  <Navbar slot="panel-bottom" class="sm:hidden"><slot name="tabs" /></Navbar>
  <Sidenav slot="panel-left" class="hidden sm:flex">
    <slot name="sections" slot="secondary" />
    <slot name="tabs" />
  </Sidenav>
  <slot />
  <Player slot="panel-right" class="hidden lg:flex" />
  <!-- /// TODO: Refactor into a search component -->
  <div slot="panel-top" class="hidden gap-16 p-[21px] pb-0 sm:flex">
    <Input bind:value={$search} class="w-full" resettable placeholder="Search">
      <Icon name="search" />
    </Input>
    <LightSwitch />
  </div>
</Layout>
