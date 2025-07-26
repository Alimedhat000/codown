import { FiEye as EyeIcon } from 'react-icons/fi';
import { GrSplit as SplitIcon } from 'react-icons/gr';
import { TbPencil as EditIcon } from 'react-icons/tb';

interface ModeSelectorProps {
  mode?: 'edit' | 'both' | 'view';
  onChange?: (mode: 'edit' | 'both' | 'view') => void;
}

const modes = [
  { key: 'edit', icon: EditIcon },
  { key: 'both', icon: SplitIcon },
  { key: 'view', icon: EyeIcon },
] as const;

export default function ModeSelector({
  mode = 'edit',
  onChange,
}: ModeSelectorProps) {
  return (
    <div
      className=" items-center gap-0.5 p-[1px] border border-surface-variant rounded-sm
      md:gap-0.5 md:p-0.5 hidden md:flex
      "
    >
      {modes.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange?.(key)}
          className={`${
            mode === key ? 'bg-surface-variant' : ''
          } p-2 rounded hover:bg-surface-variant
            sm:p-3
            focus:outline-none
          `}
          style={{ minWidth: 36, minHeight: 36 }}
        >
          <Icon size={12} className="sm:size-4  size-3" />
        </button>
      ))}
    </div>
  );
}
