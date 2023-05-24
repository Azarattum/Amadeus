import { createTRPCProxyClient, createWSClient, wsLink } from "@trpc/client";
import type { App } from "../../../plugins/trpc/routes";
import { observable } from "@trpc/server/observable";

export const { sync, search, streams, expand, desource, transcribe } =
  createTRPCProxyClient<App>({
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
