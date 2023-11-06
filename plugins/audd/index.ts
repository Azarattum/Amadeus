import { recognize, connect, init } from "./plugin";
import { convert, success, error } from "./types";
import { concat } from "./meta";

init(function* ({ audd: { token } }) {
  if (!token) throw "No token found!";
  this.connect.baseURL = "wss://api.audd.io/ws/";
  if (token.includes("/")) {
    const [key, value] = token.split("/");
    this.connect.params = { [key]: value };
  } else this.connect.params = { api_token: token };
});

recognize(function* (stream) {
  const connection = connect();
  yield* connection.send(stream().pipeThrough(concat()));
  const { result } = yield* connection.recv(success, error);
  if (!result) return;
  yield convert(result);
});
