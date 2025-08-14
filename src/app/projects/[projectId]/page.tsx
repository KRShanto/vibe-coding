import React from "react";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectsPage({ params }: Props) {
  const { projectId } = await params;

  return <div>ProjectsPage: {projectId}</div>;
}
