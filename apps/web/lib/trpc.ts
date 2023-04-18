import { createTRPCProxyClient, createWSClient, wsLink } from "@trpc/client";
import type { App } from "../../../plugins/trpc/routes";
import { observable } from "@trpc/server/observable";

export const { pull, push, search, next } = createTRPCProxyClient<App>({
  links: [
    !globalThis.localStorage?.getItem("remote")
      ? () => () => observable(() => {})
      : wsLink({
          client: createWSClient({
            url: () => localStorage.getItem("remote") as string,
          }),
        }),
  ],
});
