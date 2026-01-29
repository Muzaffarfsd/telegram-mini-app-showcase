import { motion } from "framer-motion";

export function Ultimate2026Loader() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Dynamic Glass Morphism Container */}
      <div className="relative h-48 w-48 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden flex items-center justify-center">
        
        {/* Animated Background Mesh Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]"
        />

        {/* The "Neural" Core */}
        <div className="relative z-10">
          {/* Main Pulsing Orb */}
          <motion.div
            animate={{
              scale: [0.9, 1.1, 0.9],
              filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-12 w-12 rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8),inset_0_0_10px_rgba(255,255,255,0.5)]"
          />

          {/* Orbiting Particles (Neural Connections) */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2 + i,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  y: [0, -40, 0],
                  scale: [1, 0.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,1)]"
                style={{ transform: `translateY(-40px)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Liquid Progress Ring */}
        <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
          <motion.circle
            cx="50%"
            cy="50%"
            r="80"
            fill="transparent"
            stroke="url(#emerald-gradient)"
            strokeWidth="2"
            strokeDasharray="502"
            animate={{
              strokeDashoffset: [502, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>

        {/* Scanning Beam Effect */}
        <motion.div
          animate={{
            top: ["-10%", "110%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-0 w-full h-1/4 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none"
        />
      </div>

      {/* Modern Haptic Shadow */}
      <div className="absolute -bottom-8 w-32 h-4 bg-emerald-500/10 blur-xl rounded-full" />
    </div>
  );
}
