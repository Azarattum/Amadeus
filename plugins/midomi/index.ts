import { init, recognize, connect } from "./plugin";
import { async } from "@amadeus-music/core";
import { convert, success } from "./types";
import { promisify } from "util";
import { gunzip } from "zlib";

init(function* () {
  this.connect.baseURL = "wss://houndify.midomi.com/";
});

recognize(function* (stream) {
  const connection = connect();
  /// DEBUG
  // connection.socket.on("message", (x) => console.log(JSON.parse(x.toString())));
  yield* connection.send({ version: "1.0" });
  yield* connection.recv();
  yield* connection.send(stream());
  yield* connection.send({ endOfAudio: true });
  const data = (yield* connection.recv()) as Buffer;
  const results = yield* async(
    promisify(gunzip)(data).then(
      (x) => success.create(JSON.parse(x.toString())),
      () => null
    )
  );
  if (results) {
    yield* results.AllResults.flatMap((x) => x.NativeData.Tracks.map(convert));
  }
});
