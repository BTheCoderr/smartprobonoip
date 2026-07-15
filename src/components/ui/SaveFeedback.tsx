export function SaveFeedback({
  message,
  tone = "success",
}: {
  message: string | null;
  tone?: "success" | "info";
}) {
  if (!message) return null;

  const styles =
    tone === "success"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : "border-mist-200 bg-white text-navy-700";

  return (
    <p
      role="status"
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium shadow-sm ${styles}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
          tone === "success" ? "bg-teal-600 text-white" : "bg-mist-200 text-navy-600"
        }`}
        aria-hidden
      >
        ✓
      </span>
      {message}
    </p>
  );
}
