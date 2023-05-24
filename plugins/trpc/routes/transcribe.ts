import { procedure, transcribe as transcribeOf } from "../plugin";
import { track } from "@amadeus-music/protocol";
import { first } from "@amadeus-music/core";

export const transcribe = procedure.input(track).query(async ({ input }) => {
  return await first(transcribeOf(input));
});
