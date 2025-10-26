import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { playCharacterSound } from "../utils/audio";

interface EnemyMessageProps {
  message: string;
  speaker?: string;
}

export function EnemyMessage({ message, speaker }: EnemyMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when message changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [message]);

  useEffect(() => {
    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + message[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        
        // Play sound for each character (skip spaces and punctuation for variety)
        const char = message[currentIndex];
        if (char && char !== ' ' && char !== '　') {
          playCharacterSound('MASUMOTO');
        }
      }, 50); // 50ms per character

      return () => clearTimeout(timer);
    }
  }, [currentIndex, message]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-40 retro-text"
    >
      <div className="bg-black border-4 border-[#FFD700] p-6 max-w-md mx-4">
        {speaker && (
          <div className="text-[#FF4444] mb-3 text-center">* {speaker}</div>
        )}
        <div className="text-[#FFD700] leading-relaxed text-center min-h-[1.5em]">
          {displayedText}
        </div>
      </div>
    </motion.div>
  );
}