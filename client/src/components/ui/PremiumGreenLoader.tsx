import { motion } from "framer-motion";

export function PremiumGreenLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative flex items-center justify-center">
        {/* Внешнее пульсирующее кольцо */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-24 w-24 rounded-full bg-emerald-500/20 blur-xl"
        />
        
        {/* Среднее вращающееся кольцо с градиентом */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-16 w-16 rounded-full border-t-2 border-r-2 border-emerald-500 border-l-transparent border-b-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
        
        {/* Центральное ядро с эффектом дыхания */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-6 w-6 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center space-y-2"
      >
        <span className="text-lg font-medium bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent tracking-widest uppercase">
          Загрузка
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
