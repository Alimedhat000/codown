import { Link } from "react-router";
import ModeSelector from "./ModeSelector";
import { useState } from "react";

export function NavLeft() {
  const [mode, setMode] = useState<"edit" | "both" | "view">("edit");

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        to="/dashboard/docs"
        className="flex items-center gap-2 p-1 max-h-22 rounded hover:bg-surface-variant"
      >
        <img
          src="https://placehold.co/10"
          alt="user"
          className="w-6 h-6 rounded-full"
        />
        <span className="">My Workspace</span>
      </Link>
      <ModeSelector mode={mode} onChange={setMode} />
    </div>
  );
}
