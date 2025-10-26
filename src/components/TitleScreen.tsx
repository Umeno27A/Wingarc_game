import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [pressSpace, setPressSpace] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onStart();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onStart]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center retro-text">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.h1
          className="text-[#FFD700] text-4xl mb-12"
          animate={{
            textShadow: [
              "0 0 10px #FFD700",
              "0 0 20px #FFD700",
              "0 0 10px #FFD700",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          MASUMOTALE
        </motion.h1>

        <motion.div
          className="text-[#FF4444] text-sm border-4 border-[#FFD700] bg-black px-8 py-3 inline-block"
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          PRESS SPACE
        </motion.div>

        <div className="mt-12 text-[#FFD700]/70 text-xs space-y-1">
          <div>WASD: MOVE</div>
          <div>SPACE: SELECT</div>
        </div>
      </motion.div>
    </div>
  );
}