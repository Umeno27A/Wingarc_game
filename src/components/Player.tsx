import { motion } from "motion/react";

interface PlayerProps {
  x: number;
  y: number;
  size: number;
  isInvincible: boolean;
}

export function Player({ x, y, size, isInvincible }: PlayerProps) {
  return (
    <motion.div
      className={`absolute ${isInvincible ? "opacity-50" : "opacity-100"}`}
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
      animate={isInvincible ? { opacity: [0.3, 1, 0.3] } : {}}
      transition={isInvincible ? { duration: 0.3, repeat: Infinity } : {}}
    >
      {/* Undertale-style red heart */}
      <svg width={size} height={size} viewBox="0 0 30 30">
        <path
          d="M15 27 L5 17 C3 15 3 11 5 9 C7 7 11 7 13 9 L15 11 L17 9 C19 7 23 7 25 9 C27 11 27 15 25 17 Z"
          fill="#FF0000"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  );
}