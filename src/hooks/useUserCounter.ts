import { useEffect, useState } from 'react';

const STORAGE_KEY = 'umbrella_user_count';
const STORAGE_TIME_KEY = 'umbrella_user_count_time';
const INITIAL_COUNT = 134;

// Realistic user growth simulation
// Adds 1 user every ~3-8 minutes during "active hours"
// Slower at night
export function useUserCounter(): number {
  const [count, setCount] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedTime = localStorage.getItem(STORAGE_TIME_KEY);
    
    if (stored && storedTime) {
      const baseCount = parseInt(stored, 10);
      const lastUpdate = parseInt(storedTime, 10);
      const elapsedMinutes = (Date.now() - lastUpdate) / 60000;
      
      // Simulate offline growth: ~1 user per 5 mins on average
      const offlineGrowth = Math.floor(elapsedMinutes / 5);
      const newCount = baseCount + offlineGrowth;
      
      localStorage.setItem(STORAGE_KEY, newCount.toString());
      localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
      return newCount;
    }
    
    localStorage.setItem(STORAGE_KEY, INITIAL_COUNT.toString());
    localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
    return INITIAL_COUNT;
  });

  useEffect(() => {
    // Real-time growth simulation
    const scheduleNext = () => {
      // Random interval between 3-8 minutes (180-480 seconds)
      // Sometimes shorter bursts (2 users in quick succession)
      const hour = new Date().getHours();
      const isNightTime = hour >= 2 && hour <= 8;
      
      // Slower at night, faster during peak hours (18-23)
      const isPeakTime = hour >= 18 && hour <= 23;
      
      let minDelay = 180000; // 3 min
      let maxDelay = 480000; // 8 min
      
      if (isNightTime) {
        minDelay = 600000; // 10 min
        maxDelay = 1200000; // 20 min
      } else if (isPeakTime) {
        minDelay = 90000; // 1.5 min
        maxDelay = 300000; // 5 min
      }
      
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      
      return setTimeout(() => {
        setCount((prev) => {
          const next = prev + 1;
          localStorage.setItem(STORAGE_KEY, next.toString());
          localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
          return next;
        });
        timerRef = scheduleNext();
      }, delay);
    };

    let timerRef = scheduleNext();
    return () => clearTimeout(timerRef);
  }, []);

  return count;
}
