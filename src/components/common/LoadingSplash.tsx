import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface LoadingSplashProps {
  message?: string;
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({
  message = 'Initializing Scorevault Education Engine...'
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-slate-900 selection:bg-blue-100">

      {/* Central Animated Graphic */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulsing Outer Rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-28 h-28 rounded-full bg-blue-100 border border-blue-300"
        />
        <motion.div
          animate={{ scale: [1.2, 1.5, 1.2], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute w-36 h-36 rounded-full bg-indigo-50 border border-indigo-200"
        />

        {/* Central Logo Box */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="relative w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center shadow-xl ring-4 ring-blue-50"
        >
          <ShieldCheck className="w-9 h-9 text-blue-400" />
        </motion.div>
      </div>

      {/* Brand Typography & Status Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-black text-2xl tracking-tight text-slate-950 font-display">
            SCORE<span className="text-blue-600">VAULT</span>
          </span>
          <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            INDIA
          </span>
        </div>

        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase mb-4">
          Know Before You Choose
        </p>

        {/* Loading Bar Graphic */}
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto mb-3 border border-slate-200/60">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-full"
          />
        </div>

        <p className="text-xs text-slate-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{message}</span>
        </p>
      </motion.div>

    </div>
  );
};
