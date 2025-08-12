import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
  },
  {
    event: "hello.world",
  },
  async ({ event, step }) => {
    await step.sleep("Wait a second", "1s");
    return { message: `Hello ${event.data.name}!` };
  }
);
