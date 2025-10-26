import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Bullet, BulletData } from "./Bullet";
import { CommandMenu, CommandType } from "./CommandMenu";
import { HPBar } from "./HPBar";
import { DialogBox } from "./DialogBox";
import { ShootMinigame } from "./ShootMinigame";
import { GoalEffect } from "./GoalEffect";
import { EnemyMessage } from "./EnemyMessage";
import { generateMasumotoLine } from "../utils/gemini";

type GamePhase = "intro" | "enemy_turn" | "player_turn" | "shoot" | "goal" | "end" | "action" | "enemy_message";

interface BattleFieldProps {
  onBattleEnd: (victory: boolean, playerHp: number, enemyHp: number) => void;
}

const ARENA_WIDTH = 280;
const ARENA_HEIGHT = 280;
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 4;

export function BattleField({ onBattleEnd }: BattleFieldProps) {
  // Player state
  const [playerX, setPlayerX] = useState(ARENA_WIDTH / 2);
  const [playerY, setPlayerY] = useState(ARENA_HEIGHT / 2);
  const [playerHp, setPlayerHp] = useState(50);
  const [isInvincible, setIsInvincible] = useState(false);

  // Enemy state
  const [enemyHp, setEnemyHp] = useState(300);
  const [enemyPhase, setEnemyPhase] = useState(1);

  // Game state
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [bullets, setBullets] = useState<BulletData[]>([]);
  const [message, setMessage] = useState("MASUMOTOが現れた！");
  const [messageSpeaker, setMessageSpeaker] = useState<string | undefined>(undefined);
  const [turnCount, setTurnCount] = useState(0);
  const [shootPower, setShootPower] = useState(0);
  const [shootCount, setShootCount] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const patternCleanupRef = useRef<(() => void) | null>(null);

  // Generate attack pattern
  const generateAttackPattern = useCallback((phase: number) => {
    const patterns: (() => void)[] = [];
    let patternInterval: NodeJS.Timeout;

    // Pattern 1: Spiral from edges
    const spiralPattern = () => {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      const bulletCount = 8 + Math.floor(Math.random() * 4) + (phase === 3 ? 4 : 0); // Phase 3: 12-15 bullets
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2 + Math.random() * 0.3;
        const startRadius = 200; // Start from outside
        const speed = (1.8 + Math.random() * 0.8) * (phase === 3 ? 1.4 : 1); // Phase 3: 40% faster
        setTimeout(() => {
          setBullets((prev) => [
            ...prev,
            {
              id: `spiral-${Date.now()}-${i}`,
              x: centerX + Math.cos(angle) * startRadius,
              y: centerY + Math.sin(angle) * startRadius,
              vx: -Math.cos(angle) * speed,
              vy: -Math.sin(angle) * speed,
              size: 14 + Math.floor(Math.random() * 4), // 14-17
              type: "normal",
            },
          ]);
        }, i * (40 + Math.random() * 30) * (phase === 3 ? 0.6 : 1)); // Phase 3: faster spawn
      }
    };

    // Pattern 2: Left-Right Sweep
    const sweepPattern = () => {
      const bulletCount = 4 + Math.floor(Math.random() * 3) + (phase === 3 ? 3 : 0); // Phase 3: 7-9 bullets
      const fromLeft = Math.random() > 0.5;
      for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
          setBullets((prev) => [
            ...prev,
            {
              id: `sweep-${Date.now()}-${i}`,
              x: fromLeft ? 0 : ARENA_WIDTH,
              y: 40 + i * 50 + Math.random() * 20,
              vx: (fromLeft ? 1 : -1) * (3.5 + Math.random()) * (phase === 3 ? 1.3 : 1),
              vy: (Math.random() - 0.5) * 0.5,
              size: 22 + Math.floor(Math.random() * 6), // 22-27
              type: "fire",
            },
          ]);
        }, i * (180 + Math.random() * 80) * (phase === 3 ? 0.6 : 1));
      }
    };

    // Pattern 3: Circle Burst from edges
    const burstPattern = () => {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      const bulletCount = 10 + Math.floor(Math.random() * 6) + (phase === 3 ? 6 : 0); // Phase 3: 16-21 bullets
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2 + Math.random() * 0.2;
        const startRadius = 200;
        const speed = (2.2 + Math.random() * 0.8) * (phase === 3 ? 1.35 : 1); // Phase 3: 35% faster
        setBullets((prev) => [
          ...prev,
          {
            id: `burst-${Date.now()}-${i}`,
            x: centerX + Math.cos(angle) * startRadius,
            y: centerY + Math.sin(angle) * startRadius,
            vx: -Math.cos(angle) * speed,
            vy: -Math.sin(angle) * speed,
            size: 12 + Math.floor(Math.random() * 5), // 12-16
            type: "curve",
          },
        ]);
      }
    };

    // Pattern 4: Wall with gaps
    const wallPattern = () => {
      const bulletCount = 9 + Math.floor(Math.random() * 3) + (phase === 3 ? 2 : 0); // Phase 3: 11-13 bullets
      const gapCount = phase === 3 ? 1 : 2; // Phase 3: only 1 gap!
      const gapPositions = Array.from({length: gapCount}, () => Math.floor(Math.random() * bulletCount));
      const fromRight = Math.random() > 0.5;
      for (let i = 0; i < bulletCount; i++) {
        if (gapPositions.includes(i)) continue; // Create random gaps
        setTimeout(() => {
          setBullets((prev) => [
            ...prev,
            {
              id: `wall-${Date.now()}-${i}`,
              x: fromRight ? ARENA_WIDTH : 0,
              y: i * 30 + Math.random() * 10,
              vx: (fromRight ? -1 : 1) * (2.8 + Math.random() * 0.6) * (phase === 3 ? 1.4 : 1),
              vy: 0,
              size: 20 + Math.floor(Math.random() * 6), // 20-25
              type: "normal",
            },
          ]);
        }, i * (70 + Math.random() * 30) * (phase === 3 ? 0.5 : 1));
      }
    };

    // Pattern 5: Zigzag
    const zigzagPattern = () => {
      const bulletCount = 5 + Math.floor(Math.random() * 3) + (phase === 3 ? 3 : 0); // Phase 3: 8-10 bullets
      for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
          const fromLeft = i % 2 === 0;
          setBullets((prev) => [
            ...prev,
            {
              id: `zigzag-${Date.now()}-${i}`,
              x: fromLeft ? 0 : ARENA_WIDTH,
              y: i * 45 + Math.random() * 15,
              vx: (fromLeft ? 1 : -1) * (2.8 + Math.random() * 0.6) * (phase === 3 ? 1.45 : 1),
              vy: (0.8 + Math.random() * 0.6) * (phase === 3 ? 1.3 : 1),
              size: 18 + Math.floor(Math.random() * 5), // 18-22
              type: "fire",
            },
          ]);
        }, i * (140 + Math.random() * 40) * (phase === 3 ? 0.5 : 1));
      }
    };

    // Pattern 6: Random Scatter
    const scatterPattern = () => {
      const bulletCount = 7 + Math.floor(Math.random() * 4) + (phase === 3 ? 5 : 0); // Phase 3: 12-15 bullets
      for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
          const fromTop = Math.random() > 0.3;
          setBullets((prev) => [
            ...prev,
            {
              id: `scatter-${Date.now()}-${i}`,
              x: fromTop ? Math.random() * ARENA_WIDTH : (Math.random() > 0.5 ? 0 : ARENA_WIDTH),
              y: fromTop ? 0 : Math.random() * ARENA_HEIGHT,
              vx: (Math.random() - 0.5) * 4.5 * (phase === 3 ? 1.3 : 1),
              vy: (fromTop ? 2 + Math.random() * 2 : (Math.random() - 0.5) * 3) * (phase === 3 ? 1.3 : 1),
              size: 16 + Math.floor(Math.random() * 5), // 16-20
              type: "curve",
            },
          ]);
        }, i * (90 + Math.random() * 40) * (phase === 3 ? 0.5 : 1));
      }
    };

    // Pattern 7: Cross Attack from edges
    const crossPattern = () => {
      const bulletCount = 4 + Math.floor(Math.random() * 2) + (phase === 3 ? 4 : 0); // Phase 3: 8-9 bullets
      for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
          const angle = (i * Math.PI) / 2 + Math.random() * 0.4;
          const distance = 200;
          const speed = (3.2 + Math.random() * 0.8) * (phase === 3 ? 1.5 : 1); // Phase 3: 50% faster
          setBullets((prev) => [
            ...prev,
            {
              id: `cross-${Date.now()}-${i}`,
              x: ARENA_WIDTH / 2 + Math.cos(angle) * distance,
              y: ARENA_HEIGHT / 2 + Math.sin(angle) * distance,
              vx: -Math.cos(angle) * speed,
              vy: -Math.sin(angle) * speed,
              size: 22 + Math.floor(Math.random() * 6), // 22-27
              type: "fire",
            },
          ]);
        }, i * (90 + Math.random() * 40) * (phase === 3 ? 0.4 : 1));
      }
    };

    // Pattern 8: Wave
    const wavePattern = () => {
      const bulletCount = 7 + Math.floor(Math.random() * 3) + (phase === 3 ? 4 : 0); // Phase 3: 11-13 bullets
      const fromTop = Math.random() > 0.5;
      for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
          setBullets((prev) => [
            ...prev,
            {
              id: `wave-${Date.now()}-${i}`,
              x: i * 40 + Math.random() * 15,
              y: fromTop ? 0 : ARENA_HEIGHT,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (fromTop ? 1 : -1) * (2.8 + Math.random() * 0.6) * (phase === 3 ? 1.5 : 1),
              size: 18 + Math.floor(Math.random() * 5), // 18-22
              type: "normal",
            },
          ]);
        }, i * (110 + Math.random() * 40) * (phase === 3 ? 0.5 : 1));
      }
    };

    // Pattern 9: Tornado
    const tornadoPattern = () => {
      const centerX = ARENA_WIDTH / 2;
      const centerY = ARENA_HEIGHT / 2;
      const bulletCount = 14 + Math.floor(Math.random() * 6) + (phase === 3 ? 8 : 0); // Phase 3: 22-27 bullets
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 4 + Math.random() * 0.3; // Double spiral
        const radius = 50 + i * 5 + Math.random() * 10;
        const speed = (1.8 + Math.random() * 0.6) * (phase === 3 ? 1.6 : 1); // Phase 3: 60% faster
        setTimeout(() => {
          setBullets((prev) => [
            ...prev,
            {
              id: `tornado-${Date.now()}-${i}`,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              vx: Math.cos(angle + Math.PI / 2) * speed,
              vy: Math.sin(angle + Math.PI / 2) * speed,
              size: 16 + Math.floor(Math.random() * 5), // 16-20
              type: "curve",
            },
          ]);
        }, i * (35 + Math.random() * 20) * (phase === 3 ? 0.4 : 1));
      }
    };

    // Pattern 10: Converge
    const convergePattern = () => {
      const bulletCount = 10 + Math.floor(Math.random() * 6) + (phase === 3 ? 8 : 0); // Phase 3: 18-23 bullets
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2 + Math.random() * 0.2;
        const startX = ARENA_WIDTH / 2 + Math.cos(angle) * 200;
        const startY = ARENA_HEIGHT / 2 + Math.sin(angle) * 200;
        const speed = (1.8 + Math.random() * 0.6) * (phase === 3 ? 1.55 : 1); // Phase 3: 55% faster
        setTimeout(() => {
          setBullets((prev) => [
            ...prev,
            {
              id: `converge-${Date.now()}-${i}`,
              x: startX,
              y: startY,
              vx: -Math.cos(angle) * speed,
              vy: -Math.sin(angle) * speed,
              size: 20 + Math.floor(Math.random() * 6), // 20-25
              type: "fire",
            },
          ]);
        }, i * (70 + Math.random() * 30) * (phase === 3 ? 0.5 : 1));
      }
    };

    // Add patterns based on phase
    if (phase === 1) {
      patterns.push(spiralPattern, sweepPattern, burstPattern, wallPattern);
    } else if (phase === 2) {
      patterns.push(spiralPattern, sweepPattern, burstPattern, wallPattern, zigzagPattern, scatterPattern, crossPattern);
    } else {
      patterns.push(spiralPattern, sweepPattern, burstPattern, wallPattern, zigzagPattern, scatterPattern, crossPattern, wavePattern, tornadoPattern, convergePattern);
    }
    
    // Run patterns in random order
    const runPattern = () => {
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      randomPattern();
    };
    
    // Initial burst
    burstPattern();
    
    // Start continuous pattern generation with random intervals
    const scheduleNextPattern = () => {
      const delay = (1200 + Math.random() * 800) * (phase === 3 ? 0.55 : 1); // Phase 3: patterns come 45% faster
      patternInterval = setTimeout(() => {
        runPattern();
        scheduleNextPattern();
      }, delay);
    };
    
    scheduleNextPattern();
    
    // Store cleanup function
    return () => clearTimeout(patternInterval);
  }, []);

  // Start enemy message (before attack)
  const startEnemyMessage = useCallback(async () => {
    setPhase("enemy_message");
    setMessage("...");
    setMessageSpeaker("MASUMOTO");
    
    // Generate AI line
    const aiLine = await generateMasumotoLine(turnCount, enemyPhase, shootCount);
    setMessage(aiLine);
    setMessageSpeaker("MASUMOTO");
    
    // Calculate message display time (character count * 50ms + 2 seconds buffer)
    const displayTime = aiLine.length * 50 + 2000;
    
    // After message is displayed, start attack
    setTimeout(() => {
      startEnemyAttack();
    }, displayTime);
  }, [turnCount, enemyPhase, shootCount]);

  // Start enemy attack
  const startEnemyAttack = useCallback(() => {
    // Clean up previous pattern if exists
    if (patternCleanupRef.current) {
      patternCleanupRef.current();
      patternCleanupRef.current = null;
    }
    
    setPhase("enemy_turn");
    setMessage("");
    setMessageSpeaker(undefined);
    
    // Start attack pattern immediately
    patternCleanupRef.current = generateAttackPattern(enemyPhase);

    setTimeout(() => {
      // Clean up pattern when turn ends
      if (patternCleanupRef.current) {
        patternCleanupRef.current();
        patternCleanupRef.current = null;
      }
      setPhase("player_turn");
      setMessage("あなたのターン！");
      setMessageSpeaker(undefined);
      setBullets([]);
      setTurnCount(prev => prev + 1);
    }, 5000);
  }, [enemyPhase, generateAttackPattern]);

  // Start enemy turn (wrapper for compatibility)
  const startEnemyTurn = useCallback(async () => {
    startEnemyMessage();
  }, [startEnemyMessage]);

  // Handle command
  const handleCommand = useCallback((command: CommandType) => {
    switch (command) {
      case "shoot":
        setPhase("shoot");
        setMessage("シュートを打つ！");
        setMessageSpeaker(undefined);
        break;
      
      case "taunt":
        setPhase("action");
        setMessage("MASUMOTOに　ちょうはつは　きかない");
        setMessageSpeaker(undefined);
        setEnemyPhase((prev) => Math.min(3, prev + 1));
        setTimeout(startEnemyTurn, 1000);
        break;
      
      case "time":
        setPhase("action");
        setMessage("タイム！体力が回復した！");
        setMessageSpeaker(undefined);
        setPlayerHp((prev) => Math.min(50, prev + 30));
        setTimeout(startEnemyTurn, 2000);
        break;
      
      case "ignore":
        setPhase("action");
        setMessage("まだまだサッカーが足りてないだろ");
        setMessageSpeaker("MASUMOTO");
        setTimeout(startEnemyTurn, 2000);
        break;
    }
  }, [startEnemyTurn]);

  // Handle shoot completion
  const handleShootComplete = useCallback((power: number) => {
    const newShootCount = shootCount + 1;
    setShootPower(power);
    setShootCount(newShootCount);
    
    // 11th shot always wins
    if (newShootCount === 11) {
      setPhase("goal");
      setTimeout(() => {
        setPhase("end");
        setTimeout(() => onBattleEnd(true, playerHp, 0), 2000);
      }, 3000);
      setEnemyHp(0);
      return;
    }
    
    // First 9 shots always miss (Undertale style)
    if (newShootCount < 9) {
      setMessage('シュートは届かなかった...');
      setMessageSpeaker(undefined);
      setPhase("goal");
      setTimeout(() => {
        setPhase("player_turn");
        startEnemyTurn();
      }, 2000);
      return;
    }
    
    // 9th and 10th shots do damage but don't kill
    const damage = power * 0.3; // Reduced damage to ensure 11 shots needed
    setEnemyHp((prev) => {
      const newHp = Math.max(1, prev - damage); // Keep at least 1 HP until 11th shot
      return newHp;
    });

    setPhase("goal");
    setTimeout(() => {
      setPhase("player_turn");
      startEnemyTurn();
    }, 2000);
  }, [shootCount, playerHp, onBattleEnd, startEnemyTurn]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      // Move player
      if (phase === "enemy_turn") {
        let newX = playerX;
        let newY = playerY;

        if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a") || keysPressed.current.has("A")) newX -= PLAYER_SPEED;
        if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d") || keysPressed.current.has("D")) newX += PLAYER_SPEED;
        if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("w") || keysPressed.current.has("W")) newY -= PLAYER_SPEED;
        if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("s") || keysPressed.current.has("S")) newY += PLAYER_SPEED;

        newX = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, newX));
        newY = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, newY));

        setPlayerX(newX);
        setPlayerY(newY);
      }

      // Move bullets
      if (phase === "enemy_turn") {
        setBullets((prevBullets) => {
          return prevBullets
            .map((bullet) => ({
              ...bullet,
              x: bullet.x + bullet.vx,
              y: bullet.y + bullet.vy,
            }))
            .filter(
              (bullet) =>
                bullet.x > -50 &&
                bullet.x < ARENA_WIDTH + 50 &&
                bullet.y > -50 &&
                bullet.y < ARENA_HEIGHT + 50
            );
        });

        // Check collision
        if (!isInvincible) {
          bullets.forEach((bullet) => {
            const dx = bullet.x - playerX;
            const dy = bullet.y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Reduced hit detection radius for better dodge capability
            if (distance < (PLAYER_SIZE + bullet.size) / 2 * 0.6) {
              setPlayerHp((prev) => {
                const newHp = prev - 10;
                if (newHp <= 0) {
                  setPhase("end");
                  setTimeout(() => onBattleEnd(false, 0, enemyHp), 1000);
                  return 0;
                }
                return newHp;
              });
              setIsInvincible(true);
              setTimeout(() => setIsInvincible(false), 1000);
              setBullets((prev) => prev.filter((b) => b.id !== bullet.id));
            }
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase, playerX, playerY, bullets, isInvincible, enemyHp, onBattleEnd]);

  // Start first turn
  useEffect(() => {
    if (phase === "intro") {
      setTimeout(() => {
        setPhase("player_turn");
        setMessage("あなたのターン！");
        setMessageSpeaker(undefined);
      }, 2000);
    }
  }, [phase]);

  // Update enemy phase based on HP
  useEffect(() => {
    // Update phase based on shoot count
    if (shootCount >= 8 && enemyPhase < 3) {
      setEnemyPhase(3);
      setMessage("MASUMOTO、本気の本気！");
      setMessageSpeaker("MASUMOTO");
    } else if (shootCount >= 6 && enemyPhase === 1) {
      setEnemyPhase(2);
      setMessage("MASUMOTOが本気を出した！");
      setMessageSpeaker("MASUMOTO");
    }
  }, [shootCount, enemyPhase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full h-screen flex flex-col justify-center retro-text">
        {/* Enemy Display Above Arena */}
        <div className="flex justify-center mb-2">
          <Enemy hp={enemyHp} maxHp={300} phase={enemyPhase} />
        </div>

        {/* Battle Arena */}
        <div className="flex justify-center mb-4">
          <div
            className="relative bg-black border-4 border-[#FFD700] overflow-hidden"
            style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
          >
            {phase === "enemy_turn" && (
              <>
                <Player x={playerX} y={playerY} size={PLAYER_SIZE} isInvincible={isInvincible} />
                {bullets.map((bullet) => (
                  <Bullet key={bullet.id} bullet={bullet} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Shoot Minigame */}
        {phase === "shoot" && (
          <div className="flex justify-center mb-4">
            <ShootMinigame onComplete={handleShootComplete} />
          </div>
        )}

        {/* Bottom UI Box */}
        <div className="border-4 border-[#FFD700] bg-black p-4">
          {/* HP Bar */}
          <div className="mb-3">
            <HPBar current={playerHp} max={50} label="あなた" color="bg-[#FFD700]" />
          </div>

          {/* Dialog Box */}
          <div className="mb-3">
            {/* Only show DialogBox for non-MASUMOTO messages */}
            {messageSpeaker !== "MASUMOTO" && (
              <DialogBox message={message} speaker={messageSpeaker} />
            )}
            {/* Show empty box when MASUMOTO is speaking */}
            {messageSpeaker === "MASUMOTO" && (
              <div className="border-4 border-[#FFD700] bg-black p-3 min-h-[80px]"></div>
            )}
          </div>

          {/* Command Menu */}
          {phase === "player_turn" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CommandMenu onCommand={handleCommand} />
            </motion.div>
          )}
        </div>

        {/* Goal Effect */}
        <AnimatePresence>
          {phase === "goal" && <GoalEffect power={shootPower} />}
        </AnimatePresence>

        {/* Enemy Message Popup */}
        <AnimatePresence>
          {messageSpeaker === "MASUMOTO" && phase !== "enemy_turn" && phase !== "goal" && (
            <EnemyMessage message={message} speaker={messageSpeaker} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}