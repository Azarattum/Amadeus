import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { inferAsyncReturnType } from "@trpc/server";
import { hash, persistence, users } from "./plugin";

export async function createContext({ req }: CreateWSSContextFnOptions) {
  const nobody = { persistence: null };
  try {
    if (!req.url) return nobody;
    const [trpc, user, password] = req.url.replace(/^\//, "").split("/");
    if (trpc !== "trpc") return nobody;
    if (!Object.keys(await users()).includes(user.toLowerCase())) return nobody;

    const data = persistence(user.toLowerCase());
    const token = await data.settings.extract("password", "settings");
    if (token !== (await hash(password))) return nobody;

    return { persistence: data };
  } catch {
    return nobody;
  }
}
export type Context = inferAsyncReturnType<typeof createContext>;
