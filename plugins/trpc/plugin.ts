import {
  defaulted,
  register,
  string,
  bright,
  reset,
} from "@amadeus-music/core";
import { type inferAsyncReturnType, TRPCError, initTRPC } from "@trpc/server";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { version, name } from "./package.json";

export const {
  persistence,
  transcribe,
  desource,
  command,
  expand,
  search,
  users,
  info,
  init,
  stop,
  wrn,
  ok,
} = register({
  settings: { password: defaulted(string(), "") },
  version,
  name,
});

type Context = inferAsyncReturnType<typeof context>;
const { middleware, procedure, router } = initTRPC.context<Context>().create();

function hash(text: string) {
  return crypto.subtle
    .digest("SHA-1", new TextEncoder().encode(text))
    .then((x) => Array.from(new Uint8Array(x)))
    .then((x) => x.map((y) => y.toString(16).padStart(2, "0")).join(""));
}

async function context({ req }: CreateWSSContextFnOptions) {
  const nobody = {} as {
    persistence?: undefined;
    cache?: undefined;
    name?: undefined;
  };
  try {
    if (!req.url) return nobody;
    const [trpc, user, password] = req.url.replace(/^\//, "").split("/");
    if (trpc !== "trpc") return nobody;
    const self = (await users())[user.toLowerCase()];
    if (!self) return nobody;

    if (self.password !== (await hash(password))) return nobody;
    return {
      persistence: () => persistence(user.toLowerCase()),
      name: `${bright}${self.name}${reset}`,
      cache: () => persistence(),
    };
  } catch {
    return nobody;
  }
}

const auth = middleware(({ next, ctx }) => {
  if (!ctx.persistence) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next<Required<Context>>({ ctx });
});

const protectedProcedure = procedure.use(auth);

export { protectedProcedure as procedure, context, router, hash };
