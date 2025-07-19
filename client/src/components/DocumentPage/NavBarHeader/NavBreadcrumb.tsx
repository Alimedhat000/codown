export function NavBreadcrumb() {
  return (
    <div className="flex items-center gap-2 md:">
      <span className="text-text-tertiary hover:text-text-secondary hidden md:inline">
        My workspace /
      </span>
      <span className="text-white font-medium">Title</span>
    </div>
  );
}
