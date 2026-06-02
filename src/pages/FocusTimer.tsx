import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, AlertCircle } from 'lucide-react';
import { Card, Button, AliAvatar } from '@/components';
import { focusSessionsOps, blockedSitesOps } from '@/store/db';
import type { FocusSession, BlockedSite } from '@/types';
import { generateId, formatDuration } from '@/utils/helpers';

interface FocusTimerProps {
  onSessionComplete?: () => void;
}

const PRESET_SITES: { name: string; url: string; category: string }[] = [
  { name: 'YouTube', url: 'youtube.com', category: 'entertainment' },
  { name: 'TikTok', url: 'tiktok.com', category: 'social' },
  { name: 'Instagram', url: 'instagram.com', category: 'social' },
  { name: 'Reddit', url: 'reddit.com', category: 'social' },
  { name: 'X (Twitter)', url: 'twitter.com', category: 'social' },
  { name: 'Twitch', url: 'twitch.tv', category: 'entertainment' },
  { name: 'Discord', url: 'discord.com', category: 'social' },
];

export function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [blockedAttempts, setBlockedAttempts] = useState(0);
  const [todayStats, setTodayStats] = useState({ sessions: 0, totalMinutes: 0 });

  useEffect(() => {
    loadBlockedSites();
    loadTodayStats();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const loadBlockedSites = async () => {
    const sites = await blockedSitesOps.getAll();
    if (sites.length === 0) {
      // Initialize preset sites
      for (const site of PRESET_SITES) {
        const blockedSite: BlockedSite = {
          id: generateId(),
          url: site.url,
          name: site.name,
          category: site.category as BlockedSite['category'],
          blocked: true,
        };
        await blockedSitesOps.add(blockedSite);
        sites.push(blockedSite);
      }
    }
    setBlockedSites(sites.filter((s) => s.blocked));
  };

  const loadTodayStats = async () => {
    const todaySessions = await focusSessionsOps.getToday();
    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    setTodayStats({
      sessions: todaySessions.length,
      totalMinutes,
    });
  };

  const handleStart = useCallback(() => {
    const session: FocusSession = {
      id: generateId(),
      startTime: new Date(),
      duration: selectedDuration,
      blockedSites: blockedSites.map((s) => s.url),
      blockedAttempts: 0,
      completed: false,
    };
    setCurrentSession(session);
    setIsRunning(true);
  }, [selectedDuration, blockedSites]);

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(selectedDuration * 60);
    setCurrentSession(null);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (currentSession) {
      const completedSession: FocusSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        blockedAttempts,
      };
      await focusSessionsOps.add(completedSession);
      setTodayStats((prev) => ({
        sessions: prev.sessions + 1,
        totalMinutes: prev.totalMinutes + selectedDuration,
      }));
    }
    onSessionComplete?.();
  };

  const toggleSite = async (site: BlockedSite) => {
    await blockedSitesOps.toggle(site.id);
    loadBlockedSites();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100;

  const durations = [15, 25, 45, 60];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <Card className="text-center py-12">
            {/* Timer Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DC143C" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-6xl font-bold tracking-wider"
                  style={{
                    textShadow: '0 0 30px rgba(220,20,60,0.5)',
                  }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>
                <p className="text-gray-400 mt-2">
                  {isRunning ? 'Stay focused!' : 'Ready to focus?'}
                </p>
              </div>
            </div>

            {/* Duration Selector */}
            {!isRunning && timeRemaining === selectedDuration * 60 && (
              <div className="flex justify-center gap-3 mb-8">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => {
                      setSelectedDuration(duration);
                      setTimeRemaining(duration * 60);
                    }}
                    className={`
                      px-4 py-2 rounded-xl font-medium transition-all duration-300
                      ${selectedDuration === duration
                        ? 'bg-crimson text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }
                    `}
                  >
                    {duration}m
                  </button>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Play size={20} />}
                  onClick={handleStart}
                >
                  {currentSession ? 'Resume' : 'Start Focus'}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Pause size={20} />}
                  onClick={handlePause}
                >
                  Pause
                </Button>
              )}
              <Button
                variant="ghost"
                size="lg"
                icon={<RotateCcw size={20} />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>

            {/* Quick Tips */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Zap size={16} className="text-crimson" />
                <span>Pro tip: Block distracting sites for better focus</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Coffee size={18} className="text-purple-400" />
              Today's Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sessions</span>
                <span className="text-xl font-bold text-crimson">{todayStats.sessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Time</span>
                <span className="text-xl font-bold">{formatDuration(todayStats.totalMinutes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Blocked Attempts</span>
                <span className="text-xl font-bold text-orange-400">{blockedAttempts}</span>
              </div>
            </div>
          </Card>

          {/* Blocked Sites */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-crimson" />
              Focus Shield
            </h3>
            <div className="space-y-2">
              {blockedSites.slice(0, 5).map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm">{site.name}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              +{blockedSites.length - 5} more sites blocked
            </p>
          </Card>
        </div>
      </div>

      {/* Session History */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          <RecentSessions />
        </div>
      </Card>
    </div>
  );
}

function RecentSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    const load = async () => {
      const all = await focusSessionsOps.getRecent(7);
      setSessions(all.slice(0, 5));
    };
    load();
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No sessions yet. Start your first focus session!</p>
      </div>
    );
  }

  return (
    <>
      {sessions.map((session) => (
        <motion.div
          key={session.id}
          className="flex items-center justify-between p-3 rounded-xl bg-white/5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              session.completed ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {session.completed ? <Zap size={18} /> : <Coffee size={18} />}
            </div>
            <div>
              <p className="font-medium">{formatDuration(session.duration)} session</p>
              <p className="text-sm text-gray-400">
                {new Date(session.startTime).toLocaleDateString()}
              </p>
            </div>
          </div>
          {session.completed && (
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
              Completed
            </span>
          )}
        </motion.div>
      ))}
    </>
  );
}