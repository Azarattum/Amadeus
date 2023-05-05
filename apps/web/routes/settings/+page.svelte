<script lang="ts">
  import { Button, Stack, Input, Header } from "@amadeus-music/ui";

  let hostname = "";
  let username = "";
  let password = "";
  async function login() {
    const token = await hash(password);
    const protocol = globalThis.location?.protocol === "http:" ? "ws:" : "wss:";
    const url = `${protocol}//${hostname}/trpc/${username}/${token}`;
    localStorage.setItem("remote", url);
    location.reload();
  }

  function hash(text: string) {
    if (!isSecureContext) {
      return import("sha1-browser" as any).then((x) => x.default(text));
    }
    return crypto.subtle
      .digest("SHA-1", new TextEncoder().encode(text))
      .then((x) => Array.from(new Uint8Array(x)))
      .then((x) => x.map((y) => y.toString(16).padStart(2, "0")).join(""));
  }
</script>

<Header indent xl>Connect</Header>
<Stack grow gap p screen>
  <Input placeholder="Hostname" bind:value={hostname} />
  <Input placeholder="Username" bind:value={username} />
  <Input placeholder="Password" bind:value={password} />
  <Button primary stretch on:click={login}>Login</Button>
</Stack>

<svelte:head>
  <title>Settings - Amadeus</title>
</svelte:head>
