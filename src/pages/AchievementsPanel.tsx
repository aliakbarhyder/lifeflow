import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Target,
  BookOpen,
  CheckCircle,
  Flame,
  Brain,
  Edit3,
  Sunrise,
  Moon,
  Lock,
  Unlock,
  Trophy,
} from 'lucide-react';
import { Card, ProgressRing, AliAvatar } from '@/components';
import { achievementsOps } from '@/store/db';
import type { Achievement } from '@/types';

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const all = await achievementsOps.getAll();
    setAchievements(all);
    const earned = all.reduce((sum, a) => sum + (a.unlockedAt ? 50 : 0), 0);
    setTotalXP(earned);
  };

  const iconMap: Record<string, React.ReactNode> = {
    'target': <Target size={24} />,
    'book-open': <BookOpen size={24} />,
    'check-circle': <CheckCircle size={24} />,
    'flame': <Flame size={24} />,
    'brain': <Brain size={24} />,
    'edit': <Edit3 size={24} />,
    'sunrise': <Sunrise size={24} />,
    'moon': <Moon size={24} />,
  };

  const categoryColors = {
    focus: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    learning: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    productivity: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    streak: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  };

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center py-6">
          <Trophy size={32} className="mx-auto mb-2 text-yellow-400" />
          <p className="text-3xl font-bold">{unlockedCount}</p>
          <p className="text-gray-400 text-sm">Achievements Unlocked</p>
        </Card>
        <Card className="text-center py-6">
          <Award size={32} className="mx-auto mb-2 text-purple-400" />
          <p className="text-3xl font-bold">{achievements.length - unlockedCount}</p>
          <p className="text-gray-400 text-sm">In Progress</p>
        </Card>
        <Card className="text-center py-6">
          <Flame size={32} className="mx-auto mb-2 text-crimson" />
          <p className="text-3xl font-bold">{totalXP}</p>
          <p className="text-gray-400 text-sm">XP Earned</p>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AliAvatar size="sm" animated={false} />
          Your Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const colors = categoryColors[achievement.category];
            const isUnlocked = !!achievement.unlockedAt;
            const progress = Math.min(100, (achievement.progress / achievement.target) * 100);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className={`relative overflow-hidden ${isUnlocked ? '' : 'opacity-70'}`}
                  glow={isUnlocked ? 'crimson' : 'none'}
                >
                  {/* Glow effect for unlocked */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-crimson/10 to-transparent pointer-events-none" />
                  )}

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <div className={colors.text}>
                          {iconMap[achievement.icon] || <Award size={24} />}
                        </div>
                      </div>
                      {isUnlocked ? (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <Unlock size={14} />
                          <span>Unlocked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Lock size={14} />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>
                    <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>

                    {/* Progress */}
                    {!isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span>{achievement.progress}/{achievement.target}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className={`h-full ${colors.bg.replace('/20', '')}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Unlocked date */}
                    {isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-3">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Category Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['focus', 'learning', 'productivity', 'streak'] as const).map((cat) => {
            const catAchievements = achievements.filter((a) => a.category === cat);
            const unlocked = catAchievements.filter((a) => a.unlockedAt).length;
            const progress = catAchievements.length > 0 ? (unlocked / catAchievements.length) * 100 : 0;
            const colors = categoryColors[cat];

            return (
              <div key={cat} className="text-center">
                <ProgressRing
                  progress={progress}
                  size={80}
                  strokeWidth={6}
                  color={colors.text.replace('text-', '#').replace('-400', '')}
                />
                <p className={`font-medium mt-2 ${colors.text}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </p>
                <p className="text-sm text-gray-500">{unlocked}/{catAchievements.length}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}