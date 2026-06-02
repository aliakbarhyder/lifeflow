import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, StatCard, ProgressRing, AliAvatar } from '@/components';
import { focusSessionsOps, tasksOps, notesOps, flashcardsOps } from '@/store/db';
import type { Analytics } from '@/types';
import {
  calculateFocusScore,
  calculateProductivityScore,
  calculateLearningScore,
  calculateConsistencyScore,
  calculateLifeflowScore,
  getStreakDays,
  getMostProductiveHour,
  formatDuration,
  getDateString,
} from '@/utils/helpers';

interface AnalyticsPanelProps {
  analytics: Analytics | null;
}

export function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const [focusData, setFocusData] = useState<{
    today: number;
    week: number;
    month: number;
    total: number;
  }>({ today: 0, week: 0, month: 0, total: 0 });
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
  const [hourlyData, setHourlyData] = useState<{ hour: number; count: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const sessions = await focusSessionsOps.getAll();
    const tasks = await tasksOps.getAll();
    const notes = await notesOps.getAll();
    const flashcards = await flashcardsOps.getAll();

    // Calculate focus stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    setFocusData({
      today: sessions
        .filter((s) => new Date(s.startTime) >= today)
        .reduce((sum, s) => sum + s.duration, 0),
      week: sessions
        .filter((s) => new Date(s.startTime) >= weekAgo)
        .reduce((sum, s) => sum + s.duration, 0),
      month: sessions
        .filter((s) => new Date(s.startTime) >= monthAgo)
        .reduce((sum, s) => sum + s.duration, 0),
      total: sessions.reduce((sum, s) => sum + s.duration, 0),
    });

    // Task stats
    const completed = tasks.filter((t) => t.completed).length;
    setTaskStats({
      completed,
      pending: tasks.length - completed,
      completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
    });

    // Hourly distribution
    const hourCounts: Record<number, number> = {};
    sessions.forEach((s) => {
      const hour = new Date(s.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    setHourlyData(
      Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour)
    );

    // Weekly data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);

    const weekData: { day: string; minutes: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = getDateString(date);
      const dayMinutes = sessions
        .filter((s) => getDateString(new Date(s.startTime)) === dateStr)
        .reduce((sum, s) => sum + s.duration, 0);
      weekData.push({ day: days[date.getDay()], minutes: dayMinutes });
    }
    setWeeklyData(weekData);
  };

  const maxHourly = Math.max(...hourlyData.map((h) => h.count), 1);
  const maxWeekly = Math.max(...weeklyData.map((w) => w.minutes), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <AliAvatar size="md" animated={false} />
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-400 text-sm">Track your productivity and growth</p>
        </div>
      </div>

      {/* Main Scores */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center">
              <ProgressRing
                progress={analytics.focusScore}
                size={100}
                color="#DC143C"
                label="Focus"
              />
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <ProgressRing
                progress={analytics.productivityScore}
                size={100}
                color="#8B5CF6"
                label="Productivity"
              />
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <ProgressRing
                progress={analytics.learningScore}
                size={100}
                color="#3B82F6"
                label="Learning"
              />
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center">
              <ProgressRing
                progress={analytics.consistencyScore}
                size={100}
                color="#22C55E"
                label="Consistency"
              />
            </Card>
          </motion.div>
        </div>
      )}

      {/* LifeFlow Score */}
      {analytics && (
        <Card className="text-center py-8 bg-gradient-to-br from-crimson/10 to-purple-600/10">
          <p className="text-sm text-gray-400 mb-2">Your LifeFlow Score</p>
          <motion.p
            className="text-6xl font-bold gradient-text"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
          >
            {analytics.lifeflowScore}
          </motion.p>
          <p className="text-gray-400 mt-2">Based on all performance metrics</p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Today"
          value={formatDuration(focusData.today)}
          icon={<Clock size={24} />}
          color="crimson"
        />
        <StatCard
          title="This Week"
          value={formatDuration(focusData.week)}
          icon={<Calendar size={24} />}
          color="purple"
        />
        <StatCard
          title="This Month"
          value={formatDuration(focusData.month)}
          icon={<BarChart3 size={24} />}
          color="blue"
        />
        <StatCard
          title="Total Time"
          value={formatDuration(focusData.total)}
          icon={<Activity size={24} />}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-crimson" />
            Weekly Activity
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full bg-gradient-to-t from-crimson to-purple-500 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.minutes / maxWeekly) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ minHeight: day.minutes > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            Most Productive Hours
          </h3>
          <div className="space-y-2">
            {hourlyData.slice(0, 8).map((data) => (
              <div key={data.hour} className="flex items-center gap-3">
                <span className="w-12 text-sm text-gray-400">
                  {data.hour.toString().padStart(2, '0')}:00
                </span>
                <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-crimson"
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.count / maxHourly) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="w-8 text-sm text-right">{data.count}</span>
              </div>
            ))}
            {hourlyData.length === 0 && (
              <p className="text-center text-gray-500 py-8">No data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Task Completion */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-green-400" />
          Task Completion
        </h3>
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Completion Rate</span>
              <span className="font-bold">{Math.round(taskStats.completionRate)}%</span>
            </div>
            <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${taskStats.completionRate}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{taskStats.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}