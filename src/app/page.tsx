"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.codeAgent.mutationOptions({}));
  const [input, setInput] = useState("");

  const onClick = () => {
    invoke.mutate({ text: input });
    toast.success("Background job invoked!");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Code with AI</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mb-4 w-full"
        placeholder="Enter your prompt"
      />
      <Button onClick={onClick}>Run Agent</Button>
    </div>
  );
}
