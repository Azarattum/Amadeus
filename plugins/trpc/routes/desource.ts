import { desource as desourceOf, procedure, info } from "../plugin";
import { format, track } from "@amadeus-music/protocol";
import { first } from "@amadeus-music/core";

export const desource = procedure.input(track).query(async ({ input, ctx }) => {
  info(`${ctx.name} requested source of "${format(input)}".`);
  return await first(desourceOf(input));
});
