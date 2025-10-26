import { motion } from "motion/react";

export interface BulletData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: "normal" | "fire" | "curve";
}

interface BulletProps {
  bullet: BulletData;
}

export function Bullet({ bullet }: BulletProps) {
  const getEmoji = () => {
    switch (bullet.type) {
      case "fire":
        return "🔥";
      case "curve":
        return "🌀";
      default:
        return "⚽";
    }
  };

  const getColor = () => {
    switch (bullet.type) {
      case "fire":
        return "bg-[#FF4444]";
      case "curve":
        return "bg-[#4444FF]";
      default:
        return "bg-[#FFD700]";
    }
  };

  return (
    <motion.div
      className={`absolute ${getColor()} rounded-full border-2 border-white flex items-center justify-center shadow-lg`}
      style={{
        left: bullet.x - bullet.size / 2,
        top: bullet.y - bullet.size / 2,
        width: bullet.size,
        height: bullet.size,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      <span className="text-xl">{getEmoji()}</span>
    </motion.div>
  );
}