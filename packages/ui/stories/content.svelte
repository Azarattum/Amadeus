<script>
  import { Stack } from "@amadeus-music/ui";

  export let i = 5;
</script>

<Stack center gap p>
  <p class="max-w-lg rounded-lg bg-slate-200 p-2 shadow-xl dark:bg-slate-500">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis assumenda
    corrupti repellat tempora consequatur veniam ea, quae, vero non, repellendus
    hic iusto alias fuga ipsa delectus sequi repudiandae explicabo tenetur!
  </p>
  {#each Array.from({ length: i }) as _}
    <p class="max-w-lg rounded-lg bg-surface-100 p-2 shadow-xl">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus odit
      fuga delectus repellendus sequi quas. Unde, ratione maxime vitae
      laudantium repellendus nobis iste et officiis aliquid in iusto, mollitia
      repudiandae.
    </p>
  {/each}
</Stack>
