import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  BookOpen,
  CheckCircle,
  Award,
  Flame,
  Clock,
  TrendingUp,
  Settings,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  Coffee,
} from 'lucide-react';
import { Card, StatCard, ProgressRing, Button, AliAvatar, Modal } from '@/components';
import {
  focusSessionsOps,
  tasksOps,
  notesOps,
  achievementsOps,
  initializeDefaults,
} from '@/store/db';
import type { FocusSession, Task, Achievement } from '@/types';
import {
  generateId,
  formatDuration,
  getDateString,
  calculateFocusScore,
  calculateProductivityScore,
  calculateLearningScore,
  calculateConsistencyScore,
  calculateLifeflowScore,
  getStreakDays,
} from '@/utils/helpers';
import { FocusTimer } from './FocusTimer';
import { NotesPanel } from './NotesPanel';
import { TasksPanel } from './TasksPanel';
import { LearningPanel } from './LearningPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { SettingsPanel } from './SettingsPanel';
import { ReflectionPanel } from './ReflectionPanel';
import { Onboarding } from './Onboarding';

type TabId = 'focus' | 'notes' | 'tasks' | 'learning' | 'achievements' | 'analytics' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('focus');
  const [showReflection, setShowReflection] = useState(false);
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeDefaults();
      setIsInitialized(true);
    };
    init();
  }, []);

  const loadStats = async () => {
    const sessions = await focusSessionsOps.getAll();
    const tasks = await tasksOps.getAll();
    
    const streak = getStreakDays(sessions);
    const totalXp = sessions.reduce((sum, s) => sum + s.duration * 10, 0);
    const level = Math.floor(totalXp / 100) + 1;
    
    setUserStats({ level, xp: totalXp, streak });
  };

  const handleSessionComplete = () => {
    setShowReflection(true);
    loadStats();
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    loadStats();
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'focus', label: 'Focus', icon: <Target size={18} /> },
    { id: 'notes', label: 'Notes', icon: <BookOpen size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle size={18} /> },
    { id: 'learning', label: 'Learn', icon: <Zap size={18} /> },
    { id: 'achievements', label: 'Awards', icon: <Award size={18} /> },
    { id: 'analytics', label: 'Stats', icon: <TrendingUp size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'focus':
        return <FocusTimer onSessionComplete={handleSessionComplete} />;
      case 'notes':
        return <NotesPanel />;
      case 'tasks':
        return <TasksPanel onUpdate={loadStats} />;
      case 'learning':
        return <LearningPanel />;
      case 'achievements':
        return <AchievementsPanel />;
      case 'analytics':
        return <AnalyticsPanel analytics={null} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <FocusTimer onSessionComplete={handleSessionComplete} />;
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="relative">
                  <AliAvatar size="md" glow />
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">LifeFlow AI</h1>
                  <p className="text-xs text-gray-400">Powered by ALI</p>
                </div>
              </motion.div>
            </div>

            {/* User Stats */}
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-crimson/20 to-purple-600/20 border border-crimson/30">
                <Flame size={16} className="text-crimson" />
                <span className="text-sm font-semibold">Level {userStats.level}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-crimson to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(userStats.xp % 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <span className="text-xs text-gray-400">{userStats.xp} XP</span>
              </div>

              <div className="flex items-center gap-2">
                <Flame size={16} className={userStats.streak > 0 ? 'text-orange-400' : 'text-gray-500'} />
                <span className="text-sm font-medium">{userStats.streak}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard title="Focus Score" value="0" icon={<Target size={24} />} color="crimson" />
          <StatCard title="Productivity" value="0" icon={<TrendingUp size={24} />} color="purple" />
          <StatCard title="Learning" value="0" icon={<Zap size={24} />} color="blue" />
          <StatCard title="LifeFlow" value="0" icon={<Sparkles size={24} />} color="green" />
        </motion.div>

        {/* Navigation Tabs */}
        <motion.nav
          className="flex gap-2 p-1 mb-6 rounded-xl bg-white/5 overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-crimson text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.nav>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Reflection Modal */}
      <Modal
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        title="Session Complete! 🎉"
        size="lg"
      >
        <ReflectionPanel onComplete={() => {
          setShowReflection(false);
          loadStats();
        }} />
      </Modal>
    </div>
  );
}