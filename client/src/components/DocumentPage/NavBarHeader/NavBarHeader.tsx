import { NavLeft } from "./NavLeft";
import { NavBreadcrumb } from "./NavBreadcrumb";
import { NavRight } from "./NavRight";

export function NavBarHeader({
  mode,
  setMode,
}: {
  mode: "edit" | "both" | "view";
  setMode: (mode: "edit" | "both" | "view") => void;
}) {
  return (
    <nav
      className="flex fixed w-full top-0 left-0 right-0
      z-10 mb-4 bg-background border-border border-b items-center justify-between  px-4 py-2 text-white text-sm"
    >
      <NavLeft mode={mode} setMode={setMode} />
      <NavBreadcrumb />
      <NavRight />
    </nav>
  );
}
