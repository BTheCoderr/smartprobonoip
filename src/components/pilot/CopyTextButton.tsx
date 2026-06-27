"use client";

export function CopyTextButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  async function copy() {
    await navigator.clipboard.writeText(text);
  }

  return (
    <button type="button" onClick={copy} className="btn-secondary text-sm">
      {label}
    </button>
  );
}
