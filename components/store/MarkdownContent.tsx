"use client";

import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export function MarkdownContent({ source }: { source: string }) {
  return (
    <div data-color-mode="dark">
      <MarkdownPreview source={source} style={{ background: "transparent", color: "inherit" }} />
    </div>
  );
}
