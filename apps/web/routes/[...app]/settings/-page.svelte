<script lang="ts">
  import { Button, Header, Stack, Input } from "@amadeus-music/ui";

  let hostname = "";
  let username = "";
  let password = "";
  async function login() {
    const token = await hash(password);
    const protocols = ["ws:", "wss:", "http:", "https:"];
    const provided =
      protocols.find((x) => hostname.startsWith(x)) ||
      globalThis.location?.protocol;
    const protocol = ["http:", "ws:"].includes(provided) ? "ws:" : "wss:";
    const base = hostname.replace(/^\w+:\/\//, "");

    const url = `${protocol}//${base}/trpc/${username}/${token}`;
    localStorage.setItem("remote", url);
    location.href = "/home";
  }

  function hash(text: string) {
    return crypto.subtle
      .digest("SHA-1", new TextEncoder().encode(text))
      .then((x) => Array.from(new Uint8Array(x)))
      .then((x) => x.map((y) => y.toString(16).padStart(2, "0")).join(""));
  }
</script>

<Header indent xl>Connect</Header>
<Stack class="gap-2 p-4">
  <Input placeholder="Hostname" bind:value={hostname} />
  <Input placeholder="Username" bind:value={username} />
  <Input placeholder="Password" bind:value={password} />
  <Button primary class="place-content-center" on:click={login}>Login</Button>
</Stack>
