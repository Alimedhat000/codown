import clsx from 'clsx'; // optional, but clean
import { ReactNode, useState } from 'react';
import { LuChevronDown as ChevronIcon } from 'react-icons/lu';

type Props = {
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
};

export function DocumentSection({ title, icon, count, children }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-8">
      <div
        className="mb-4 ml-1 flex items-center gap-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
      >
        {/* Section Icon or Chevron on Hover */}
        <div className="relative group mr-1">
          <div
            className={clsx('-ml-2 transition-transform duration-200', {
              '-rotate-90': !isOpen,
              'opacity-100': !isOpen,
              'opacity-0 group-hover:opacity-100': isOpen,
            })}
          >
            <ChevronIcon size={18} />
          </div>
          {/* Show icon only if open and not hovering */}
          {isOpen && (
            <div className="absolute -ml-2 inset-0 top-0 group-hover:opacity-0 ">
              {icon}
            </div>
          )}
        </div>

        <h2>{title}</h2>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>

      {/* Conditionally render children if section is open */}
      {isOpen && children}
    </div>
  );
}
