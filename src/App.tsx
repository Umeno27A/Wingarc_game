import { useState, useEffect } from "react";
import { TitleScreen } from "./components/TitleScreen";
import { BattleField } from "./components/BattleField";
import { ResultScreen } from "./components/ResultScreen";
import { preloadAudio } from "./utils/audio";
import { playBGM, stopBGM } from "./utils/bgm";

type GameState = "title" | "battle" | "result";

interface GameResult {
  victory: boolean;
  playerHp: number;
  enemyHp: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState>("title");
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [hasSaveData, setHasSaveData] = useState(false);

  useEffect(() => {
    // Check for save data
    const savedData = localStorage.getItem("soccer-battle-save");
    setHasSaveData(!!savedData);
    
    // Preload audio files
    preloadAudio();
  }, []);

  // Play BGM based on game state
  useEffect(() => {
    if (gameState === "title") {
      // タイトル画面ではBGMを停止
      stopBGM();
    } else if (gameState === "battle") {
      playBGM("battle");
    } else if (gameState === "result" && gameResult) {
      if (gameResult.victory) {
        playBGM("victory");
      } else {
        // 敗北時は敗北BGMを再生
        playBGM("defeat");
      }
    }
  }, [gameState, gameResult]);

  const handleStart = () => {
    setGameState("battle");
    setGameResult(null);
  };

  const handleContinue = () => {
    // For now, just start a new game
    // In a full implementation, this would load saved progress
    handleStart();
  };

  const handleBattleEnd = (victory: boolean, playerHp: number, enemyHp: number) => {
    const result = { victory, playerHp, enemyHp };
    setGameResult(result);
    setGameState("result");

    // Save result
    const savedResults = JSON.parse(localStorage.getItem("soccer-battle-results") || "[]");
    savedResults.push({
      ...result,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("soccer-battle-results", JSON.stringify(savedResults));
    localStorage.setItem("soccer-battle-save", JSON.stringify(result));
    setHasSaveData(true);
  };

  const handleRestart = () => {
    setGameState("battle");
    setGameResult(null);
  };

  const handleToTitle = () => {
    setGameState("title");
    setGameResult(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {gameState === "title" && (
        <TitleScreen
          onStart={handleStart}
          onContinue={handleContinue}
          hasSaveData={hasSaveData}
        />
      )}

      {gameState === "battle" && <BattleField onBattleEnd={handleBattleEnd} />}

      {gameState === "result" && gameResult && (
        <ResultScreen
          victory={gameResult.victory}
          playerHp={gameResult.playerHp}
          enemyHp={gameResult.enemyHp}
          onRestart={handleRestart}
          onToTitle={handleToTitle}
        />
      )}
    </div>
  );
}

export default App;