import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface ShootMinigameProps {
  onComplete: (power: number) => void;
}

export function ShootMinigame({ onComplete }: ShootMinigameProps) {
  const [barPosition, setBarPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) return;

    const interval = setInterval(() => {
      setBarPosition((prev) => {
        const next = prev + direction * 2;
        if (next >= 100 || next <= 0) {
          setDirection((d) => -d);
          return Math.max(0, Math.min(100, next));
        }
        return next;
      });
    }, 20);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setCompleted(true);
        clearInterval(interval);

        const centerDistance = Math.abs(barPosition - 50);
        const power = 100 - centerDistance * 2;

        setTimeout(() => {
          onComplete(power);
        }, 300);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [barPosition, direction, completed, onComplete]);

  return (
    <div className="retro-text">
      <div className="relative w-80 h-12 bg-black border-4 border-[#FFD700]">
        {/* Perfect zone */}
        <div className="absolute left-1/2 -translate-x-1/2 w-16 h-full bg-[#4444FF]/30 border-2 border-[#4444FF]" />

        {/* Moving bar */}
        <motion.div
          className="absolute top-0 w-4 h-full bg-[#FF4444]"
          style={{ left: `${barPosition}%` }}
          animate={completed ? { scale: [1, 1.5, 1] } : {}}
        />
      </div>
    </div>
  );
}