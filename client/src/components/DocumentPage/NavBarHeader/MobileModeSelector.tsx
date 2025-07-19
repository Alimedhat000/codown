import { FiEye as EyeIcon } from "react-icons/fi";
import { TbPencil as EditIcon } from "react-icons/tb";

interface ModeSelectorProps {
  mode?: "edit" | "both" | "view";
  onChange?: (mode: "edit" | "both" | "view") => void;
}

export default function MobileModeSelector({
  mode = "edit",
  onChange,
}: ModeSelectorProps) {
  const isEdit = mode === "edit";
  const Icon = isEdit ? EyeIcon : EditIcon;

  const handleToggle = () => {
    onChange?.(isEdit ? "view" : "edit");
  };

  return (
    <button
      onClick={handleToggle}
      className="md:hidden p-3 rounded border border-surface-variant 
                 hover:bg-surface-variant focus:outline-none"
      style={{ minWidth: 36, minHeight: 36 }}
    >
      <Icon size={14} className="sm:size-4  size-3" />
    </button>
  );
}
