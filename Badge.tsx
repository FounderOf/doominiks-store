import { BadgeType } from '../types';
import { Crown, Shield, Sword, Star, Gem, Sparkles } from 'lucide-react';

interface BadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

const badgeConfig: Record<BadgeType, { 
  label: string; 
  gradient: string; 
  glow: string;
  icon: typeof Crown;
}> = {
  owner: {
    label: 'OWNER',
    gradient: 'from-yellow-400 via-yellow-500 to-amber-600',
    glow: 'shadow-yellow-500/50',
    icon: Crown
  },
  mythical: {
    label: 'MYTHICAL',
    gradient: 'from-purple-400 via-pink-500 to-red-500',
    glow: 'shadow-purple-500/50',
    icon: Sparkles
  },
  grandmaster: {
    label: 'GRANDMASTER',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    glow: 'shadow-red-500/50',
    icon: Gem
  },
  master: {
    label: 'MASTER',
    gradient: 'from-blue-400 via-blue-500 to-purple-600',
    glow: 'shadow-blue-500/50',
    icon: Star
  },
  elite: {
    label: 'ELITE',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    glow: 'shadow-emerald-500/50',
    icon: Shield
  },
  warrior: {
    label: 'WARRIOR',
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    glow: 'shadow-gray-500/50',
    icon: Sword
  }
};

export default function Badge({ type, size = 'md' }: BadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 18
  };

  return (
    <span 
      className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r ${config.gradient} text-white shadow-lg ${config.glow} ${sizeClasses[size]} animate-pulse`}
    >
      <Icon size={iconSizes[size]} />
      {config.label}
    </span>
  );
}
