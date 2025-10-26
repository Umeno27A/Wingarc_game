import { useState, useEffect } from "react";
import { motion } from "motion/react";

export type CommandType = "shoot" | "taunt" | "time" | "ignore";

interface CommandMenuProps {
  onCommand: (command: CommandType) => void;
}

const commands: { type: CommandType; label: string }[] = [
  { type: "shoot", label: "しゅーと" },
  { type: "taunt", label: "ちょうはつ" },
  { type: "time", label: "たいむ" },
  { type: "ignore", label: "みのがす" },
];

export function CommandMenu({ onCommand }: CommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onCommand(commands[selectedIndex].type);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, onCommand]);

  return (
    <div className="retro-text">
      <div className="grid grid-cols-4 gap-3">
        {commands.map((command, index) => (
          <motion.button
            key={command.type}
            onClick={() => onCommand(command.type)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`text-center p-3 border-2 transition-colors ${
              selectedIndex === index
                ? "border-[#4444FF] bg-[#4444FF]/20 text-[#4444FF]"
                : "border-[#FFD700]/50 text-[#FFD700] hover:border-[#FFD700]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-sm">{command.label}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}