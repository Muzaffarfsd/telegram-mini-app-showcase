import { m } from 'framer-motion';
import { Users, TrendingUp, Clock, Zap } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import type { LucideIcon } from 'lucide-react';

interface Stat {
  value: number;
  label: string;
  suffix: string;
  icon: LucideIcon;
  gradient: string;
}

const stats: Stat[] = [
  {
    value: 950,
    label: "Million Users",
    suffix: "M+",
    icon: Users,
    gradient: "from-[#00D9FF] to-[#0088CC]"
  },
  {
    value: 500,
    label: "Monthly Active",
    suffix: "M+",
    icon: TrendingUp,
    gradient: "from-[#BD00FF] to-[#8B00CC]"
  },
  {
    value: 40,
    label: "Minutes Daily",
    suffix: "min",
    icon: Clock,
    gradient: "from-[#FF006E] to-[#CC0055]"
  },
  {
    value: 21,
    label: "App Opens/Day",
    suffix: "x",
    icon: Zap,
    gradient: "from-[#00FF88] to-[#00CC6A]"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

interface StatCardProps {
  stat: Stat;
}

const StatCard = ({ stat }: StatCardProps) => {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, 2000);

  return (
    <m.div
      variants={itemVariants}
      className="glass-2025 rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
      whileHover={{ scale: 1.02, y: -5 }}
      data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Icon */}
      <div className="relative z-10 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Counter */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-1 mb-2">
          <span 
            className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
            data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {count}
          </span>
          <span className="text-2xl text-gray-400">{stat.suffix}</span>
        </div>
        <p className="text-gray-400 text-sm">{stat.label}</p>
      </div>

      {/* Hover Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
    </m.div>
  );
};

/**
 * StatsSection - секция с анимированной статистикой Telegram
 * Показывает ключевые метрики платформы
 */
export const StatsSection = () => {
  return (
    <section className="py-20 px-4" data-testid="stats-section">
      <div className="max-w-7xl mx-auto">
        <m.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </m.div>
      </div>
    </section>
  );
};
