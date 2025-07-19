export default function StatusBar({
  content,
  className = "not-only:",
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split("\n").length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;

  return (
    <div
      className={`text-xs text-neutral-300 bg-neutral-800 border-t px-2 py-1 flex justify-between font-mono${className}`}
    >
      <span>Lines: {lines}</span>
      <span>Words: {words}</span>
      <span>Chars: {chars}</span>
      <span>Markdown | UTF-8 | Unix</span>
    </div>
  );
}
