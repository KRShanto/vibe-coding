import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { codingAgentFunction } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [codingAgentFunction],
});
