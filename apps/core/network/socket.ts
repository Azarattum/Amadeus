import { createWebSocketStream, WebSocketServer, WebSocket } from "ws";
import { bright, reset } from "@amadeus-music/util/color";
import { merge, pick } from "@amadeus-music/util/object";
import type { Context } from "../plugin/types";
import type { Struct } from "superstruct";
import { context, async } from "libfun";
import { pools } from "../event/pool";
import { info } from "../status/log";
import { Writable } from "stream";
import type { RawData } from "ws";
import { promisify } from "util";
import { http } from "./http";
import { parse } from "url";

type ConnectOptions = {
  params?: Record<string, string[] | string>;
  baseURL?: string[] | string;
};

function connect(this: Context, url = "", options: ConnectOptions = {}) {
  const group = this?.group || context.group;
  const ctx: any = group ? pools.contexts.get(group) || {} : {};
  if (typeof ctx.fetch === "object") options = merge(ctx.connect, options);

  url = new URL(url, pick(options.baseURL)).toString();
  const params = new URLSearchParams(pick(options.params)).toString();
  if (params) {
    if (url.includes("?")) url += "&" + params;
    else url += "?" + params;
  }

  const socket = new WebSocket(url);
  const connected = new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });

  return {
    *recv<T = void, S = never>(as?: Struct<T, S>, until?: Struct<any, any>) {
      yield* async(connected);
      return yield* async(
        new Promise<T extends void ? RawData : T>((resolve, reject) => {
          if (!as) {
            socket.once("message", (data) => {
              try {
                resolve(data as any);
              } catch (err) {
                reject(err);
              }
            });
          } else {
            socket.on("message", function handler(data) {
              try {
                const parsed = JSON.parse(data.toString());
                if (as.is(parsed)) {
                  socket.off("message", handler);
                  resolve(parsed as any);
                }
                if (until?.is(parsed)) {
                  const formatted = JSON.stringify(parsed, null, 2);
                  throw new Error(
                    `End condition is reached!\nReceived: ${formatted}`,
                  );
                }
              } catch (err) {
                socket.off("message", handler);
                reject(err);
              }
            });
          }
        }),
      );
    },
    *send(data: Record<string, any> | ReadableStream | Buffer | string) {
      yield* async(connected);
      if (
        typeof data === "object" &&
        !(data instanceof Buffer) &&
        !(data instanceof ReadableStream)
      ) {
        data = JSON.stringify(data);
      }

      yield* async(
        new Promise<void>((resolve, reject) => {
          if (data instanceof ReadableStream) {
            const stream = Writable.toWeb(createWebSocketStream(socket));
            data.pipeTo(stream, { preventClose: true }).then(resolve, reject);
          } else {
            socket.send(data as any, (err) => (err ? reject(err) : resolve()));
          }
        }),
      );
    },
    *close() {
      socket.close();
      yield* async(promisify(socket.on.bind(socket))("close").catch(() => {}));
    },
    socket,
  };
}

let server = new WebSocketServer({ noServer: true });
const registered = new Set<string>();
function wss(path: string, listen = true) {
  const parent = http(listen);
  if (registered.has(path)) return server;

  parent.on("upgrade", (request, socket, head) => {
    if (!request.url) return;
    const { pathname } = parse(request.url);
    if (pathname?.startsWith(path)) {
      server.handleUpgrade(request, socket, head, (ws) => {
        server.emit("connection", ws, request);
      });
    }
  });
  registered.add(path);
  info(`Registered WebSocket handler on ${bright}${path}${reset}.`);

  if (registered.size > 1) return server;
  parent.on("close", () => {
    info("Stopping the WebSocket server...");
    server.removeAllListeners();
    registered.clear();
    server.close();
    server = new WebSocketServer({ noServer: true });
  });
  return server;
}

export { connect, wss };
export type { ConnectOptions };
