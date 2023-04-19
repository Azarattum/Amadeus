import { createServer, type Server } from "node:http";
import { init, stop } from "../event/pool";
import { err, info } from "../status/log";
import { bright, reset } from "../app";
import type { Socket } from "net";
import { async } from "libfun";

const connections = new Set<Socket>();
let server: Server | undefined;
let port: number | undefined;
init((config) => {
  port = config.port;
  server = createServer();
});

stop(function* () {
  if (!server || !server.listening) return;
  info("Stopping the HTTP server...");
  server.closeAllConnections();
  connections.forEach((x) => x.destroy());
  connections.clear();
  yield* async(new Promise((resolve) => server?.close(resolve)));
  server.removeAllListeners();
});

export function http(listen = true) {
  if (!server || !port) throw new Error("The server was not initialized!");
  if (!listen) return server;
  if (!server.listening) {
    info(`HTTP server is listening on port ${bright}${port}${reset}.`);
    server.on("connection", (socket) => {
      socket.once("close", () => connections.delete(socket));
      connections.add(socket);
    });
    server.on("error", err);
    server.listen(port);
  }
  return server;
}
