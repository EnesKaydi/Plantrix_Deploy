'use client';

import { useEffect, useState } from 'react';

export function RainEffect() {
  const [raindrops, setRaindrops] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const createRaindrops = () => {
      const drops = [];
      const numberOfDrops = 100; // Adjust for more/less rain

      for (let i = 0; i < numberOfDrops; i++) {
        const left = Math.random() * 100;
        const duration = 0.5 + Math.random() * 0.5; // 0.5s to 1.0s
        const delay = Math.random() * 10; // Start at random times
        const height = 10 + Math.random() * 60; // 40px to 100px

        drops.push(
          <div
            key={i}
            className="raindrop"
            style={{
              left: `${left}%`,
              height: `${height}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          ></div>
        );
      }
      setRaindrops(drops);
    };

    createRaindrops();
  }, []);

  return <>{raindrops}</>;
} 