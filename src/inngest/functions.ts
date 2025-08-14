import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  type Tool,
} from "@inngest/agent-kit";
import { z } from "zod";

import { PROMPT } from "@/lib/prompt";
import { prisma } from "@/lib/prisma";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codingAgentFunction = inngest.createFunction(
  { id: "coding-agent" },
  {
    event: "build-website",
  },
  async ({ step, event }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-coding-next");
      return sandbox.sandboxId;
    });

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      system: PROMPT,
      description: "An expert coding agent",
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.9,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z
            .object({
              command: z
                .string()
                .describe(
                  "The full shell command to run (e.g., npm install <package> --yes)"
                ),
            })
            .strict(),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    buffers.stdout += data;
                  },
                  onStderr(data) {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "create-or-update-files",
          description: "Create or update files in the sandbox",
          parameters: z
            .object({
              files: z
                .array(
                  z
                    .object({
                      path: z
                        .string()
                        .describe("Relative file path (e.g., app/page.tsx)"),
                      content: z.string().describe("Full file contents"),
                    })
                    .strict()
                )
                .describe("List of files to create or update"),
            })
            .strict(),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "create-or-update-files",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (error) {
                  console.error(`Error creating/updating files: ${error}`);
                  return `Error: ${error}`;
                }
              }
            );

            if (
              newFiles &&
              typeof newFiles === "object" &&
              !Array.isArray(newFiles)
            ) {
              network.state.data.files = newFiles as Record<string, string>;
            }
          },
        }),
        createTool({
          name: "read-files",
          description: "Read files from the sandbox",
          parameters: z
            .object({
              files: z
                .array(z.string())
                .describe("List of relative file paths to read"),
            })
            .strict(),
          handler: async ({ files }, { step }) => {
            return await step?.run("read-files", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                console.error(`Error reading files: ${error}`);
                return `Error: ${error}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const prompt =
      (event.data as any)?.text ?? (event.data as any)?.value ?? "";

    const result = await network.run(prompt);

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong! Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          Fragment: {
            create: {
              sandboxUrl,
              title: "Fragment",
              files: result.state.data.files || {},
            },
          },
        },
      });
    });

    // Return something to avoid unused variable lint errors
    return {
      url: sandboxUrl,
      title: "Hello file",
      files: result.state.data.files,
      summary: result.state.data.summary || "No summary provided",
    };
  }
);
