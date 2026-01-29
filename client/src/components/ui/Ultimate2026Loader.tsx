import { motion } from "framer-motion";

export function Ultimate2026Loader() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-12 w-12 rounded-full border-2 border-emerald-500/30"
      />
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-12 w-12 rounded-full border-t-2 border-emerald-500"
      />
    </div>
  );
}
