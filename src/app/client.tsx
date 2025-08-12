"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Client() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.hello.queryOptions({ text: "fuck you" })
  );

  return <div>{JSON.stringify(data)}</div>;
}
