<script lang="ts">
  import { Button, Stack, Input, Header, Spacer } from "@amadeus-music/ui";
  import { playlists, history } from "$lib/data";

  let hostname = "";
  let username = "";
  let password = "";
  async function login() {
    const token = await crypto.subtle
      .digest("SHA-1", new TextEncoder().encode(password))
      .then((x) => Array.from(new Uint8Array(x)))
      .then((x) => x.map((y) => y.toString(16).padStart(2, "0")).join(""));
    const protocol = globalThis.location?.protocol === "http:" ? "ws:" : "wss:";
    const url = `${protocol}//${hostname}/trpc/${username}/${token}`;
    localStorage.setItem("remote", url);
    location.reload();
  }
</script>

<Stack grow gap p>
  <Header xl>Connect</Header>
  <Input placeholder="Hostname" bind:value={hostname} />
  <Input placeholder="Username" bind:value={username} />
  <Input placeholder="Password" bind:value={password} />
  <Button primary stretch on:click={login}>Login</Button>
  <Stack gap grow>
    <Stack x center grow>
      <Header>History</Header>
      <Spacer />
      <Button on:click={() => history.clear()}>Clear</Button>
    </Stack>

    {#each $history as { query }}
      <p>{query}</p>
    {/each}
  </Stack>
  <Stack gap>
    {#each $playlists as playlist}
      <Header>{playlist.playlist}</Header>
      <ul>
        {#each playlist.tracks as track}
          <li>
            {track.artists.map((x) => x.title).join(", ")} - {track.title}
          </li>
        {/each}
      </ul>
    {/each}
  </Stack>
</Stack>
