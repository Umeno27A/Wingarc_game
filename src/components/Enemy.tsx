import { motion } from "motion/react";
import enemyImage from "figma:asset/d0892235d62d241a203e4693b981c8996ea20f4a.png";

interface EnemyProps {
  hp: number;
  maxHp: number;
  phase: number;
}

export function Enemy({ hp, maxHp, phase }: EnemyProps) {
  return (
    <div className="text-center retro-text">
      <div className="text-[#FFD700] mb-1">MASUMOTO</div>
      <motion.div
        className="mb-2 inline-block overflow-hidden"
        style={{ height: '120px', width: 'auto' }}
        animate={{
          y: [0, -10, 0],
          rotate: phase >= 3 ? [0, 2, -2, 0] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <img 
          src={enemyImage} 
          alt="MASUMOTO" 
          className="h-60 w-auto object-cover object-top"
        />
      </motion.div>
      <div className="text-[#FFD700] text-xs">
        HP {Math.max(0, Math.round(hp))}/{maxHp}
      </div>
    </div>
  );
}