"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

export default function Home() {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}));

  const onClick = () => {
    invoke.mutate({ text: "Owalisa" });
    toast.success("Background job invoked!");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button onClick={onClick}>Invoke Background Job</Button>
    </div>
  );
}
