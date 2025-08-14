import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

const formSchema = z.object({
  text: z
    .string()
    .min(1, { message: "Message is required" })
    .max(10000, { message: "Message is too long" }),
});

export default function MessageForm({ projectId }: { projectId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );
        // TODO: invalidate usage status
      },
      onError: (err) => {
        // TODO: redirect to pricing page if specific error
        toast.error(err.message);
      },
    })
  );

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({ value: data.text, projectId });
  };

  const [isFocused, setIsFocused] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const isPending = createMessage.isPending;
  const isDisabled = isPending || !form.formState.isValid;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none"
        )}
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              disabled={isPending}
              placeholder="What would you like to build?"
              minRows={2}
              maxRows={8}
              className={cn(
                "border-none resize-none bg-transparent outline-none w-full py-3",
                {
                  "border-red-500": form.formState.errors.text,
                }
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <span>&nbsp;Ctrl + Enter&nbsp;</span>
            </kbd>
          </div>

          <Button
            className={cn(
              "size-8 rounded-full",
              isPending && "bg-muted-foreground border"
            )}
            disabled={isDisabled}
          >
            {isPending ? (
              <Loader2Icon className="animate-spin size-4" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
