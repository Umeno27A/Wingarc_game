import { motion } from "motion/react";

interface HPBarProps {
  current: number;
  max: number;
  label: string;
  color: string;
}

export function HPBar({ current, max, label, color }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="retro-text">
      <div className="flex items-center gap-3">
        <div className="text-[#FFD700] text-xs">{label}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[#FFD700] text-xs">HP</span>
            <div className="flex-1 bg-black border-2 border-[#FFD700] h-4 relative overflow-hidden">
              <motion.div
                className={color}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%" }}
              />
            </div>
            <span className="text-[#FFD700] text-xs min-w-[60px]">
              {Math.round(current)}/{max}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}