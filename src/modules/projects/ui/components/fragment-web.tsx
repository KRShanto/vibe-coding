import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Hint } from "@/components/ui/hint";

export default function FragmentWeb({ data }: { data: Fragment }) {
  const [fragmentKey, setFragmentKey] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  function handleRefresh() {
    setFragmentKey((prev) => prev + 1);
  }

  function handleCopy() {
    navigator.clipboard.writeText(data.sandboxUrl || "");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Button size="sm" variant="outline" onClick={handleRefresh}>
          <RefreshCcwIcon />
        </Button>
        <Hint text="Click to copy" side="bottom">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="flex-1 justify-start text-start"
            disabled={!data.sandboxUrl || copied}
          >
            <span>{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in a new tab" align="start" side="bottom">
          <Button
            size="sm"
            variant="outline"
            disabled={!data.sandboxUrl}
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, "_blank");
            }}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>

      <iframe
        key={fragmentKey}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  );
}
