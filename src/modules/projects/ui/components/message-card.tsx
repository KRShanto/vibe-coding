import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

interface Props {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

interface AssistantProps extends Omit<Props, "content"> {
  content: string;
}

interface FragmentCardProps {
  fragment: Fragment;
  isActive: boolean;
  onClick: (fragment: Fragment) => void;
}

export default function MessageCard({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: Props) {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
        role={role}
      />
    );
  }

  return <UserMessage content={content} />;
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
        {content}
      </Card>
    </div>
  );
}

function AssistantMessage({
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantProps) {
  return (
    <div
      className={cn(
        "flex flex-col group px-2 pb-4",
        type === "ERROR" && "text-red-700 dark:text-red-500"
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/vibe.svg"
          alt="Vibe"
          width={20}
          height={20}
          className="shrink-0"
        />
        <span className="text-sm font-semibold">Vibe Coder</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "MMM dd, yyyy")}
        </span>
      </div>
      <div className="pl-8 flex flex-col gap-y-4">
        <span className="text-sm">{content}</span>
        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActive={isActiveFragment}
            onClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
}

function FragmentCard({ fragment, isActive, onClick }: FragmentCardProps) {
  return (
    <button
      className={cn(
        "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
        isActive &&
          "bg-primary text-primary-foreground border-primary hover:bg-primary"
      )}
      onClick={() => onClick(fragment)}
    >
      <Code2Icon className="size-4 mt-0.5 "></Code2Icon>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">
          {fragment.title}
        </span>
        <span className="text-sm">Preview</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  );
}
