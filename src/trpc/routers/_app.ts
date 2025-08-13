import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { inngest } from "@/inngest/client";
import { openai } from "inngest";

export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "hello.world",
        data: {
          name: input.text,
        },
      });
    }),
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  codeAgent: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "build-website",
        data: {
          text: input.text,
        },
      });
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
