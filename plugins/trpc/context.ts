import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { bright, reset } from "@amadeus-music/core";
import { inferAsyncReturnType } from "@trpc/server";
import { hash, persistence, users } from "./plugin";

export async function createContext({ req }: CreateWSSContextFnOptions) {
  const nobody = {} as { persistence?: undefined; name?: undefined };
  try {
    if (!req.url) return nobody;
    const [trpc, user, password] = req.url.replace(/^\//, "").split("/");
    if (trpc !== "trpc") return nobody;
    const self = (await users())[user.toLowerCase()];
    if (!self) return nobody;

    if (self.password !== (await hash(password))) return nobody;
    return {
      persistence: persistence(user.toLowerCase()),
      name: `${bright}${self.name}${reset}`,
    };
  } catch {
    return nobody;
  }
}
export type Context = inferAsyncReturnType<typeof createContext>;
