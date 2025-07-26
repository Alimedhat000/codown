import { FiShare2, FiChevronDown, FiMoreVertical } from 'react-icons/fi';
import { LuUsers } from 'react-icons/lu';

import { useMediaQuery } from '@/hooks/useMediaQuery';

export function NavRight() {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  return (
    <div className="flex items-center gap-2">
      {/* Contributors Count and Dropdown */}
      <div className="flex items-center gap-1 rounded hover:bg-surface-variant p-1">
        <span className="text-xs text-muted">1</span>
        <button className="w-6 h-6 flex items-center justify-center ">
          <LuUsers className="w-4 h-4" />
          <FiChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Current User Avatar */}
      <img
        src="https://placehold.co/10"
        alt="user"
        className="w-6 h-6 rounded-full hidden md:block"
      />

      {/* Share Button */}
      <button className="flex items-center bg-primary hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">
        <FiShare2 className="w-4 h-4 mr-1" />
        {isSmallScreen ? '' : 'Share'}
      </button>

      {/* More Options */}
      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant">
        <FiMoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
