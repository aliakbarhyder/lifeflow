import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'crimson' | 'purple' | 'none';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  hover = true,
  glow = 'none',
  onClick,
}: CardProps) {
  const glowClasses = {
    crimson: 'hover:shadow-[0_0_30px_rgba(220,20,60,0.3)]',
    purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    none: '',
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl 
        bg-gradient-to-br from-black/80 to-black/40 
        backdrop-blur-xl border border-white/10
        transition-all duration-300
        ${hover ? 'hover:border-white/20 hover:scale-[1.02]' : ''}
        ${glowClasses[glow]}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ y: -2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'crimson' | 'purple' | 'blue' | 'green';
}

export function StatCard({ title, value, icon, trend, color = 'crimson' }: StatCardProps) {
  const colorClasses = {
    crimson: 'text-crimson',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}