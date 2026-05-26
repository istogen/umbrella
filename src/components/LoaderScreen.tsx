import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderScreenProps {
  onComplete: () => void;
}

// Minecraft-style chunk loading simulation
const CHUNK_ROWS = 8;
const CHUNK_COLS = 12;
const TOTAL_CHUNKS = CHUNK_ROWS * CHUNK_COLS;
const LOAD_DURATION = 1800; // ms total load time
const CHUNK_DELAY = LOAD_DURATION / TOTAL_CHUNKS;

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ onComplete }) => {
  const [loaded, setLoaded] = useState<boolean[]>(new Array(TOTAL_CHUNKS).fill(false));
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'fade'>('loading');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Load chunks sequentially with slight randomness (like Minecraft)
    const chunkOrder = Array.from({ length: TOTAL_CHUNKS }, (_, i) => i);
    // Shuffle slightly for organic feel
    for (let i = chunkOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chunkOrder[i], chunkOrder[j]] = [chunkOrder[j], chunkOrder[i]];
    }

    chunkOrder.forEach((idx, i) => {
      const timer = setTimeout(() => {
        setLoaded((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
        setProgress(Math.round(((i + 1) / TOTAL_CHUNKS) * 100));
      }, i * CHUNK_DELAY + Math.random() * 30);
      timers.push(timer);
    });

    // Fade out after loading
    const fadeTimer = setTimeout(() => {
      setPhase('fade');
      const doneTimer = setTimeout(onComplete, 600);
      timers.push(doneTimer);
    }, LOAD_DURATION + 400);
    timers.push(fadeTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'fade' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030305]"
      >
        {/* Chunk grid */}
        <div className="relative mb-8">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${CHUNK_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${CHUNK_ROWS}, 1fr)`,
            }}
          >
            {loaded.map((isLoaded, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isLoaded ? 1 : 0.15,
                  scale: isLoaded ? 1 : 0.8,
                  backgroundColor: isLoaded
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.02)',
                }}
                transition={{ duration: 0.2 }}
                className="h-3 w-3 sm:h-4 sm:w-4 rounded-[2px]"
              />
            ))}
          </div>
        </div>

        {/* Progress text */}
        <div className="font-mono text-sm text-white/40">
          Загрузка Umbrella Crack... {progress}%
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className="h-full bg-white/60"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
