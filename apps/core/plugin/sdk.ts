/// TODO: `fetch` generator
//    - global iterator context based abort signal
//    - error prone (log errors per module)
//    - auto superstruct validation
//    - maybe use gretchen
//    - auto json parse (mb when validated?)
//      - this should be type specific (e.g. do not json parse streams)
//
// Consider the API:
//  yield* fetch(User, "...");
// vs
//  yield* fetch("...").json(); ← gretchen under the hood
//  yield* fetch("...").as(User);

function init(impl: Init) {
  /// TODO
}

function stop(impl: Stop) {
  /// TODO
}

function search(impl: Search) {
  /// TODO
}

function relate(impl: Relate) {
  /// TODO
}

function recognize(impl: Recognize) {
  /// TODO
}

/// TODO: result type
type TODO = void;

type Init = (config: Record<string, any>) => void;
type Stop = () => void;
type Search = (type: "track" | "artist" | "album", query: string) => TODO;
type Relate = (
  type: "track" | "artist" | "album",
  query: { title: string; artist: string | undefined }
) => TODO;
type Recognize = (stream: ReadableStream) => TODO;

export { init, stop, search, relate, recognize };
