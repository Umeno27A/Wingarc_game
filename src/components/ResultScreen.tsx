import { motion } from "motion/react";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { useState, useEffect } from "react";

interface ResultScreenProps {
  victory: boolean;
  playerHp: number;
  enemyHp: number;
  onRestart: () => void;
  onToTitle: () => void;
}

export function ResultScreen({ victory, playerHp, enemyHp, onRestart, onToTitle }: ResultScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        setSelectedIndex(0);
      } else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
        setSelectedIndex(1);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex === 0) {
          onRestart();
        } else {
          onToTitle();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, onRestart, onToTitle]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center retro-text">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.h1
          className={`${victory ? "text-[#FFD700]" : "text-[#FF4444]"} text-4xl mb-4`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {victory ? "YOU WIN!" : "YOU LOSE..."}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#FFD700] text-xl mb-8"
        >
          {victory
            ? "見事、MASUMOTOを倒しました！"
            : "スタミナが尽きました..."}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="border-4 border-[#FFD700] bg-black p-6 mb-8 inline-block"
        >
          <div className="text-[#FFD700] space-y-2 text-xs">
            <div>あなたのHP: {Math.max(0, Math.round(playerHp))}</div>
            <div>敵のHP: {Math.max(0, Math.round(enemyHp))}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className={`px-6 py-3 flex items-center gap-2 border-4 transition-colors text-xs ${
              selectedIndex === 0
                ? "bg-[#4444FF] text-[#FFD700] border-[#4444FF]"
                : "bg-black text-[#FFD700] border-[#FFD700]"
            }`}
          >
            <RotateCcw size={16} />
            もう一度
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToTitle}
            className={`px-6 py-3 flex items-center gap-2 border-4 transition-colors text-xs ${
              selectedIndex === 1
                ? "bg-[#4444FF] text-[#FFD700] border-[#4444FF]"
                : "bg-black text-[#FFD700] border-[#FFD700]"
            }`}
          >
            <Home size={16} />
            タイトルへ
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-[#FFD700]/50 mt-6 text-xs"
        >
          A/D: SELECT SPACE: OK
        </motion.div>
      </motion.div>
    </div>
  );
}