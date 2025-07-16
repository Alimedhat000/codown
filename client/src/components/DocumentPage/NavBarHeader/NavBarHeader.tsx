import { NavLeft } from "./NavLeft";
import { NavBreadcrumb } from "./NavBreadcrumb";
import { NavRight } from "./NavRight";

export function NavBarHeader() {
  return (
    <div className="flex bg-background border-border border-b items-center justify-between mb-5 px-4 py-2 text-white text-sm">
      <NavLeft />
      <NavBreadcrumb />
      <NavRight />
    </div>
  );
}
