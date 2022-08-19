import { readdir } from "node:fs/promises";

export async function load() {
  const files = await readdir("./stories");
  const stories = files.map((x) => x.replace(/\.svelte$/, ""));

  return { stories };
}
