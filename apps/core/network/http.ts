import { createServer, Server } from "node:http";
import { init, stop } from "../event/pool";
import { err, info } from "../status/log";
import { async } from "libfun";

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
  yield* async(new Promise((resolve) => server?.close(resolve)));
});

export function http() {
  if (!server || !port) throw new Error("The server was not initialized!");
  if (!server.listening) {
    info(`HTTP server is listening on port ${port}.`);
    server.on("error", err);
    server.listen(port);
  }
  return server;
}
