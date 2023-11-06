import { transcribe as transcribeOf, procedure, info } from "../plugin";
import { format, track } from "@amadeus-music/protocol";
import { first } from "@amadeus-music/core";

export const transcribe = procedure
  .input(track)
  .query(async ({ input, ctx }) => {
    info(`${ctx.name} requested lyrics for "${format(input)}".`);
    return await first(transcribeOf(input));
  });
