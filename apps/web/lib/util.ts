import type { Meta } from "@amadeus-music/protocol";

function match(query: string) {
  query = query.toLowerCase();
  return (x?: Meta | null) =>
    query
      ? x
        ? !!x.title?.toLowerCase().includes(query) ||
          !!x.artists?.find((x) => x.title?.toLowerCase().includes(query)) ||
          !!x.album?.title?.toLowerCase().includes(query)
        : false
      : true;
}

export { match };
