<script>
  import {
    LightSwitch,
    Sidenav,
    Layout,
    Navbar,
    Input,
    Icon,
  } from "@amadeus-music/ui";
  import { search } from "$lib/data";
  import { Player } from "..";
</script>

<Layout>
  <Navbar slot="panel-bottom" class="sm:hidden"><slot name="tabs" /></Navbar>
  <Sidenav class="hidden sm:flex" slot="panel-left">
    <slot slot="secondary" name="sections" />
    <slot name="tabs" />
  </Sidenav>
  <slot />
  <Player class="hidden lg:flex" slot="panel-right" />
  <!-- /// TODO: Refactor into a search component -->
  <div class="hidden gap-16 p-[21px] pb-0 sm:flex" slot="panel-top">
    <Input resettable placeholder="Search" class="w-full" bind:value={$search}>
      <Icon of="search" />
    </Input>
    <LightSwitch />
  </div>
</Layout>
