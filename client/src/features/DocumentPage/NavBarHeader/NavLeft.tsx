import { Link } from 'react-router';

import { paths } from '@/config/paths';

import MobileModeSelector from './MobileModeSelector';
import ModeSelector from './ModeSelector';

export function NavLeft({
  mode,
  setMode,
}: {
  mode: 'edit' | 'both' | 'view';
  setMode: (mode: 'edit' | 'both' | 'view') => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        to={paths.app.dashboard.getHref()}
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
      <MobileModeSelector mode={mode} onChange={setMode} />
    </div>
  );
}
