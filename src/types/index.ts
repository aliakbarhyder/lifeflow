// Core types for LifeFlow AI

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  level: number;
  xp: number;
  streak: number;
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  blockedSites: string[];
  blockedAttempts: number;
  completed: boolean;
  reflection?: string;
}

export interface BlockedSite {
  id: string;
  url: string;
  name: string;
  category: SiteCategory;
  blocked: boolean;
}

export type SiteCategory = 
  | 'social'
  | 'entertainment'
  | 'news'
  | 'gaming'
  | 'shopping'
  | 'custom';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'quote' | 'highlight' | 'task';
  tags: string[];
  pageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completed: boolean;
  subtasks?: SubTask[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview?: Date;
  correctCount: number;
  incorrectCount: number;
  createdAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: Date;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
  category: 'focus' | 'learning' | 'productivity' | 'streak';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'focus' | 'learning' | 'productivity' | 'growth';
  xpReward: number;
  completed: boolean;
  completedAt?: Date;
  date: string;
}

export interface ReflectionReport {
  id: string;
  date: string;
  focusSessionId: string;
  accomplishments: string;
  productivityScore: number;
  insights: string[];
  suggestions: string[];
  createdAt: Date;
}

export interface WeeklySummary {
  id: string;
  weekStart: string;
  totalFocusTime: number;
  focusSessionsCount: number;
  tasksCompleted: number;
  notesCreated: number;
  flashcardsReviewed: number;
  averageProductivityScore: number;
  achievementsUnlocked: number;
  reflections: ReflectionReport[];
  createdAt: Date;
}

export interface Analytics {
  focusScore: number;
  productivityScore: number;
  learningScore: number;
  consistencyScore: number;
  lifeflowScore: number;
  mostDistractingSites: { site: string; count: number }[];
  mostDistractingHours: { hour: number; count: number }[];
  focusTrends: { date: string; minutes: number }[];
  productivityTrends: { date: string; score: number }[];
}

export interface Settings {
  aiProvider: 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  customEndpoint?: string;
  theme: 'dark' | 'light';
  notifications: boolean;
  autoFocus: boolean;
  focusDuration: number;
  breakDuration: number;
  blockedCategories: SiteCategory[];
  customBlockedSites: string[];
}

export interface PageContent {
  url: string;
  title: string;
  content: string;
  summary?: string;
  extractedData?: {
    concepts: string[];
    actionItems: string[];
    keyPoints: string[];
  };
}