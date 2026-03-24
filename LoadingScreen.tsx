import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const texts = [
      'Initializing...',
      'Loading assets...',
      'Preparing store...',
      'Almost ready...',
      'Welcome!'
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        const newProgress = prev + Math.random() * 15 + 5;
        const textIndex = Math.min(Math.floor(newProgress / 25), texts.length - 1);
        setLoadingText(texts[textIndex]);
        return Math.min(newProgress, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Glowing circles */}
      <div className="absolute w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute w-64 h-64 bg-red-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Logo */}
      <div className="relative mb-12 z-10">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-500 tracking-wider animate-pulse">
          DOOMINIKS
        </h1>
        <p className="text-center text-red-400/80 text-lg tracking-[0.5em] mt-2">STORE</p>
        <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-lg -z-10" />
      </div>

      {/* Loading bar container */}
      <div className="relative w-80 md:w-96 z-10">
        {/* Loading bar background */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-red-900/50">
          {/* Loading bar progress */}
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-red-400/80 text-sm">{loadingText}</span>
          <span className="text-red-500 font-bold">{Math.floor(progress)}%</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 flex gap-2 z-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-red-600/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-red-600/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-red-600/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-red-600/30" />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
