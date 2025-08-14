"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());
  const invoke = useMutation(trpc.messages.create.mutationOptions({}));
  const [input, setInput] = useState("");

  const onClick = () => {
    invoke.mutate({ value: input });
    toast.success("Background job invoked!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
        Code with AI
      </h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your prompt"
        />
        <Button className="px-6 py-3 font-semibold" onClick={onClick}>
          Run Agent
        </Button>
      </div>
      {messages && (
        <pre className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(messages, null, 2)}
        </pre>
      )}
    </div>
  );
}
