"use client";

export function Toast({ message, kind = "success" }: { message: string; kind?: "success" | "error" }) {
  return (
    <div
      className={
        kind === "success"
          ? "rounded-lg border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm font-medium text-green-300"
          : "rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300"
      }
    >
      {message}
    </div>
  );
}
