import { useState } from 'react';
import { m } from 'framer-motion';
import { Briefcase, Code, Palette, Rocket, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Path {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  benefits: string[];
}

const paths: Path[] = [
  {
    id: 'business',
    icon: Briefcase,
    title: 'Для Бизнеса',
    description: 'Создайте витрину товаров или услуг',
    gradient: 'from-blue-500 to-cyan-500',
    benefits: ['Без комиссий', 'Мгновенный деплой', '950M аудитория']
  },
  {
    id: 'developers',
    icon: Code,
    title: 'Для Разработчиков',
    description: 'Создайте следующий хит в Telegram',
    gradient: 'from-purple-500 to-pink-500',
    benefits: ['React/Vue/Angular', 'Полный API', 'Open Source']
  },
  {
    id: 'designers',
    icon: Palette,
    title: 'Для Дизайнеров',
    description: 'Реализуйте смелые идеи',
    gradient: 'from-orange-500 to-red-500',
    benefits: ['Figma интеграция', 'Компоненты', 'Гайдлайны']
  },
  {
    id: 'startups',
    icon: Rocket,
    title: 'Для Стартапов',
    description: 'Запуститесь за 48 часов',
    gradient: 'from-green-500 to-emerald-500',
    benefits: ['MVP за день', 'Без App Store', 'Вирусный рост']
  }
];

interface PathCardProps {
  path: Path;
  index: number;
}

const PathCard = ({ path, index }: PathCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = path.icon;

  return (
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="glass-2025 rounded-3xl p-8 cursor-pointer relative overflow-hidden group"
      data-testid={`path-card-${path.id}`}
    >
      {/* Animated Gradient Background */}
      <m.div
        className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
      />

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center mb-6 relative z-10`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-3xl font-bold mb-3 relative z-10">{path.title}</h3>
      <p className="text-gray-400 mb-6 relative z-10">{path.description}</p>

      {/* Benefits - показываются при hover */}
      <m.div
        initial={{ height: 0, opacity: 0 }}
        animate={isHovered ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="overflow-hidden relative z-10"
      >
        <ul className="space-y-2 mb-6">
          {path.benefits.map((benefit, i) => (
            <m.li
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={isHovered ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-gray-300"
            >
              <Check className="w-5 h-5 text-green-400" />
              {benefit}
            </m.li>
          ))}
        </ul>
      </m.div>

      {/* CTA Button */}
      <button 
        className={`w-full py-3 rounded-xl bg-gradient-to-r ${path.gradient} text-white font-semibold relative z-10 hover:shadow-lg transition-shadow`}
        data-testid={`button-start-${path.id}`}
      >
        Начать →
      </button>
    </m.div>
  );
};

/**
 * InteractiveCTA - секция "Выберите свой путь"
 * 4 карточки для разных типов пользователей
 */
export const InteractiveCTA = () => {
  return (
    <section className="py-32 px-4" data-testid="interactive-cta-section">
      <div className="max-w-7xl mx-auto">
        <m.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center mb-6"
        >
          Выберите свой путь
        </m.h2>
        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl text-gray-400 text-center mb-16"
        >
          Каждый путь ведет к успеху в Telegram экосистеме
        </m.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path, i) => (
            <PathCard key={path.id} path={path} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
