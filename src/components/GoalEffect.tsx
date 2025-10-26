import { motion } from "motion/react";

interface GoalEffectProps {
  power: number;
}

export function GoalEffect({ power }: GoalEffectProps) {
  const isGreatKick = power >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 retro-text"
    >
      <div className="text-center">
        <motion.div
          className={`text-6xl ${isGreatKick ? "text-[#FFD700]" : "text-[#FF4444]"}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isGreatKick ? "GREAT KICK!" : "KICK!"}
        </motion.div>
      </div>
    </motion.div>
  );
}