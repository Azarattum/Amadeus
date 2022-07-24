import { readdir } from "fs/promises";

export async function GET() {
  const files = await readdir("./demo/stories");
  const stories = files.map((x) => x.replace(/\.svelte$/, ""));

  return {
    body: { stories },
  };
}
