// Utility functions for LifeFlow AI

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function calculateXpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function calculateXpProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const currentLevelXp = calculateXpForLevel(currentLevel);
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);
  const progress = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return progress * 100;
}

export function getStreakDays(sessions: { startTime: Date | string }[]): number {
  if (sessions.length === 0) return 0;
  
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const session of sorted) {
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays <= 1) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getMostProductiveHour(
  sessions: { startTime: Date | string; blockedAttempts: number }[]
): number {
  const hourCounts: Record<number, number> = {};
  
  for (const session of sessions) {
    const hour = new Date(session.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }
  
  let maxHour = 9;
  let maxCount = 0;
  
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxHour = parseInt(hour);
    }
  }
  
  return maxHour;
}

export function calculateProductivityScore(
  sessions: { duration: number; completed: boolean }[],
  tasks: { completed: boolean }[]
): number {
  if (sessions.length === 0 && tasks.length === 0) return 0;
  
  const completedSessions = sessions.filter((s) => s.completed).length;
  const totalSessionMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const completedTasks = tasks.filter((t) => t.completed).length;
  
  const sessionScore = Math.min(50, (completedSessions / 7) * 50);
  const durationScore = Math.min(25, (totalSessionMinutes / 420) * 25);
  const taskScore = Math.min(25, (completedTasks / 10) * 25);
  
  return Math.round(sessionScore + durationScore + taskScore);
}

export function calculateFocusScore(
  sessions: { duration: number; completed: boolean }[],
  streakDays: number
): number {
  if (sessions.length === 0) return 0;
  
  const completedSessions = sessions.filter((s) => s.completed).length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = totalMinutes / sessions.length;
  
  const completionRate = completedSessions / sessions.length;
  const avgBonus = Math.min(25, avgDuration / 4);
  const streakBonus = Math.min(25, streakDays * 2);
  
  return Math.round(completionRate * 50 + avgBonus + streakBonus);
}

export function calculateLearningScore(
  flashcards: { correctCount: number; incorrectCount: number }[],
  quizzes: { score?: number }[]
): number {
  if (flashcards.length === 0 && quizzes.length === 0) return 0;
  
  let totalCorrect = 0;
  let totalAttempts = 0;
  
  for (const card of flashcards) {
    totalCorrect += card.correctCount;
    totalAttempts += card.correctCount + card.incorrectCount;
  }
  
  const flashcardScore = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 60 : 0;
  
  let quizScore = 0;
  const completedQuizzes = quizzes.filter((q) => q.score !== undefined);
  if (completedQuizzes.length > 0) {
    const avgScore = completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / completedQuizzes.length;
    quizScore = avgScore * 40;
  }
  
  return Math.round(flashcardScore + quizScore);
}

export function calculateConsistencyScore(
  sessions: { startTime: Date | string }[]
): number {
  if (sessions.length === 0) return 0;
  
  const dates = new Set<string>();
  sessions.forEach((s) => {
    const date = new Date(s.startTime).toISOString().split('T')[0];
    dates.add(date);
  });
  
  const sortedDates = Array.from(dates).sort();
  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  const totalDays = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  const uniqueDaysRatio = dates.size / totalDays;
  return Math.round(uniqueDaysRatio * 100);
}

export function calculateLifeflowScore(
  focusScore: number,
  productivityScore: number,
  learningScore: number,
  consistencyScore: number
): number {
  return Math.round(
    focusScore * 0.3 +
    productivityScore * 0.3 +
    learningScore * 0.2 +
    consistencyScore * 0.2
  );
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}