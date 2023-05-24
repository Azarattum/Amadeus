import { procedure, desource as desourceOf } from "../plugin";
import { track } from "@amadeus-music/protocol";
import { first } from "@amadeus-music/core";

export const desource = procedure.input(track).query(async ({ input }) => {
  return await first(desourceOf(input));
});
