import type { Meta } from "@amadeus-music/protocol";

function match(query: string) {
  query = query.toLowerCase();
  if (!query) return () => true;
  return (x?: Meta | null) =>
    x?.title?.toLowerCase().includes(query) ||
    x?.album?.title?.toLowerCase().includes(query) ||
    x?.artists?.find((x) => x.title?.toLowerCase().includes(query)) ||
    false;
}

export { match };
