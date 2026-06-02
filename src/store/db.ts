import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type {
  Note,
  Task,
  Flashcard,
  Quiz,
  FocusSession,
  Achievement,
  DailyChallenge,
  ReflectionReport,
  WeeklySummary,
  Analytics,
  Settings,
  BlockedSite,
} from '@/types';

// Define database schema
interface LifeFlowDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-date': Date; 'by-type': string };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-date': Date; 'by-priority': string };
  };
  flashcards: {
    key: string;
    value: Flashcard;
    indexes: { 'by-next-review': Date };
  };
  quizzes: {
    key: string;
    value: Quiz;
    indexes: { 'by-date': Date };
  };
  focusSessions: {
    key: string;
    value: FocusSession;
    indexes: { 'by-date': string; 'by-start': Date };
  };
  achievements: {
    key: string;
    value: Achievement;
  };
  dailyChallenges: {
    key: string;
    value: DailyChallenge;
    indexes: { 'by-date': string };
  };
  reflections: {
    key: string;
    value: ReflectionReport;
    indexes: { 'by-date': string };
  };
  weeklySummaries: {
    key: string;
    value: WeeklySummary;
    indexes: { 'by-week': string };
  };
  analytics: {
    key: string;
    value: Analytics;
  };
  settings: {
    key: string;
    value: Settings;
  };
  blockedSites: {
    key: string;
    value: BlockedSite;
  };
}

const DB_NAME = 'lifeflow-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<LifeFlowDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<LifeFlowDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LifeFlowDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-date', 'createdAt');
        notesStore.createIndex('by-type', 'type');
      }

      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
        tasksStore.createIndex('by-date', 'createdAt');
        tasksStore.createIndex('by-priority', 'priority');
      }

      // Flashcards store
      if (!db.objectStoreNames.contains('flashcards')) {
        const flashcardsStore = db.createObjectStore('flashcards', { keyPath: 'id' });
        flashcardsStore.createIndex('by-next-review', 'nextReview');
      }

      // Quizzes store
      if (!db.objectStoreNames.contains('quizzes')) {
        const quizzesStore = db.createObjectStore('quizzes', { keyPath: 'id' });
        quizzesStore.createIndex('by-date', 'createdAt');
      }

      // Focus sessions store
      if (!db.objectStoreNames.contains('focusSessions')) {
        const sessionsStore = db.createObjectStore('focusSessions', { keyPath: 'id' });
        sessionsStore.createIndex('by-date', 'startTime');
        sessionsStore.createIndex('by-start', 'startTime');
      }

      // Achievements store
      if (!db.objectStoreNames.contains('achievements')) {
        db.createObjectStore('achievements', { keyPath: 'id' });
      }

      // Daily challenges store
      if (!db.objectStoreNames.contains('dailyChallenges')) {
        const challengesStore = db.createObjectStore('dailyChallenges', { keyPath: 'id' });
        challengesStore.createIndex('by-date', 'date');
      }

      // Reflections store
      if (!db.objectStoreNames.contains('reflections')) {
        const reflectionsStore = db.createObjectStore('reflections', { keyPath: 'id' });
        reflectionsStore.createIndex('by-date', 'date');
      }

      // Weekly summaries store
      if (!db.objectStoreNames.contains('weeklySummaries')) {
        const summariesStore = db.createObjectStore('weeklySummaries', { keyPath: 'id' });
        summariesStore.createIndex('by-week', 'weekStart');
      }

      // Analytics store
      if (!db.objectStoreNames.contains('analytics')) {
        db.createObjectStore('analytics', { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // Blocked sites store
      if (!db.objectStoreNames.contains('blockedSites')) {
        db.createObjectStore('blockedSites', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Generic CRUD operations
type StoreNames = 'notes' | 'tasks' | 'flashcards' | 'quizzes' | 'focusSessions' | 'achievements' | 'dailyChallenges' | 'reflections' | 'weeklySummaries' | 'analytics' | 'settings' | 'blockedSites';

export async function addItem<T extends object>(storeName: StoreNames, item: T): Promise<void> {
  const db = await getDB();
  await db.put(storeName, item as any);
}

export async function getItem<T extends object>(storeName: StoreNames, id: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get(storeName, id) as Promise<T | undefined>;
}

export async function getAllItems<T extends object>(storeName: StoreNames): Promise<T[]> {
  const db = await getDB();
  return db.getAll(storeName) as Promise<T[]>;
}

export async function deleteItem(storeName: StoreNames, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, id);
}

export async function updateItem<T extends object>(storeName: StoreNames, item: T): Promise<void> {
  const db = await getDB();
  await db.put(storeName, item as any);
}

// Notes operations
export const notesOps = {
  async add(note: Note): Promise<void> {
    await addItem('notes', note);
  },
  async get(id: string): Promise<Note | undefined> {
    return getItem<Note>('notes', id);
  },
  async getAll(): Promise<Note[]> {
    return getAllItems<Note>('notes');
  },
  async update(note: Note): Promise<void> {
    await updateItem('notes', note);
  },
  async delete(id: string): Promise<void> {
    await deleteItem('notes', id);
  },
  async search(query: string): Promise<Note[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },
};

// Tasks operations
export const tasksOps = {
  async add(task: Task): Promise<void> {
    await addItem('tasks', task);
  },
  async get(id: string): Promise<Task | undefined> {
    return getItem<Task>('tasks', id);
  },
  async getAll(): Promise<Task[]> {
    return getAllItems<Task>('tasks');
  },
  async update(task: Task): Promise<void> {
    await updateItem('tasks', task);
  },
  async delete(id: string): Promise<void> {
    await deleteItem('tasks', id);
  },
  async getByPriority(priority: Task['priority']): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter((task) => task.priority === priority);
  },
  async getCompleted(): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter((task) => task.completed);
  },
  async getPending(): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter((task) => !task.completed);
  },
};

// Flashcards operations
export const flashcardsOps = {
  async add(card: Flashcard): Promise<void> {
    await addItem('flashcards', card);
  },
  async get(id: string): Promise<Flashcard | undefined> {
    return getItem<Flashcard>('flashcards', id);
  },
  async getAll(): Promise<Flashcard[]> {
    return getAllItems<Flashcard>('flashcards');
  },
  async update(card: Flashcard): Promise<void> {
    await updateItem('flashcards', card);
  },
  async delete(id: string): Promise<void> {
    await deleteItem('flashcards', id);
  },
  async getDue(): Promise<Flashcard[]> {
    const all = await this.getAll();
    const now = new Date();
    return all.filter((card) => !card.nextReview || new Date(card.nextReview) <= now);
  },
};

// Focus sessions operations
export const focusSessionsOps = {
  async add(session: FocusSession): Promise<void> {
    await addItem('focusSessions', session);
  },
  async get(id: string): Promise<FocusSession | undefined> {
    return getItem<FocusSession>('focusSessions', id);
  },
  async getAll(): Promise<FocusSession[]> {
    return getAllItems<FocusSession>('focusSessions');
  },
  async update(session: FocusSession): Promise<void> {
    await updateItem('focusSessions', session);
  },
  async delete(id: string): Promise<void> {
    await deleteItem('focusSessions', id);
  },
  async getRecent(days: number = 7): Promise<FocusSession[]> {
    const all = await this.getAll();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return all.filter((session) => new Date(session.startTime) >= cutoff);
  },
  async getToday(): Promise<FocusSession[]> {
    const all = await this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return all.filter((session) => new Date(session.startTime) >= today);
  },
};

// Achievements operations
export const achievementsOps = {
  async add(achievement: Achievement): Promise<void> {
    await addItem('achievements', achievement);
  },
  async getAll(): Promise<Achievement[]> {
    return getAllItems<Achievement>('achievements');
  },
  async update(achievement: Achievement): Promise<void> {
    await updateItem('achievements', achievement);
  },
  async unlock(id: string): Promise<void> {
    const achievement = await getItem<Achievement>('achievements', id);
    if (achievement) {
      achievement.unlockedAt = new Date();
      achievement.progress = achievement.target;
      await this.update(achievement);
    }
  },
};

// Daily challenges operations
export const dailyChallengesOps = {
  async add(challenge: DailyChallenge): Promise<void> {
    await addItem('dailyChallenges', challenge);
  },
  async getAll(): Promise<DailyChallenge[]> {
    return getAllItems<DailyChallenge>('dailyChallenges');
  },
  async getByDate(date: string): Promise<DailyChallenge[]> {
    const all = await this.getAll();
    return all.filter((challenge) => challenge.date === date);
  },
  async complete(id: string): Promise<void> {
    const challenge = await getItem<DailyChallenge>('dailyChallenges', id);
    if (challenge) {
      challenge.completed = true;
      challenge.completedAt = new Date();
      await updateItem('dailyChallenges', challenge);
    }
  },
};

// Reflections operations
export const reflectionsOps = {
  async add(reflection: ReflectionReport): Promise<void> {
    await addItem('reflections', reflection);
  },
  async getAll(): Promise<ReflectionReport[]> {
    return getAllItems<ReflectionReport>('reflections');
  },
  async getByDate(date: string): Promise<ReflectionReport | undefined> {
    const all = await this.getAll();
    return all.find((r) => r.date === date);
  },
};

// Analytics operations
export const analyticsOps = {
  async save(analytics: Analytics): Promise<void> {
    await addItem('analytics', { ...analytics, id: 'main' });
  },
  async get(): Promise<Analytics> {
    const analytics = await getItem<Analytics>('analytics', 'main');
    return analytics || getDefaultAnalytics();
  },
};

// Settings operations
export const settingsOps = {
  async save(settings: Settings): Promise<void> {
    await addItem('settings', { ...settings, id: 'user-settings' });
  },
  async get(): Promise<Settings> {
    const settings = await getItem<Settings>('settings', 'user-settings');
    return settings || getDefaultSettings();
  },
};

// Blocked sites operations
export const blockedSitesOps = {
  async add(site: BlockedSite): Promise<void> {
    await addItem('blockedSites', site);
  },
  async getAll(): Promise<BlockedSite[]> {
    return getAllItems<BlockedSite>('blockedSites');
  },
  async update(site: BlockedSite): Promise<void> {
    await updateItem('blockedSites', site);
  },
  async delete(id: string): Promise<void> {
    await deleteItem('blockedSites', id);
  },
  async toggle(id: string): Promise<void> {
    const site = await getItem<BlockedSite>('blockedSites', id);
    if (site) {
      site.blocked = !site.blocked;
      await this.update(site);
    }
  },
};

// Default values
function getDefaultAnalytics(): Analytics {
  return {
    focusScore: 0,
    productivityScore: 0,
    learningScore: 0,
    consistencyScore: 0,
    lifeflowScore: 0,
    mostDistractingSites: [],
    mostDistractingHours: [],
    focusTrends: [],
    productivityTrends: [],
  };
}

function getDefaultSettings(): Settings {
  return {
    aiProvider: 'openai',
    theme: 'dark',
    notifications: true,
    autoFocus: false,
    focusDuration: 25,
    breakDuration: 5,
    blockedCategories: ['social', 'entertainment'],
    customBlockedSites: [],
  };
}

// Initialize default achievements
export async function initializeDefaults(): Promise<void> {
  const achievements = await achievementsOps.getAll();
  if (achievements.length === 0) {
    const defaultAchievements: Achievement[] = [
      { id: 'focus-warrior', name: 'Focus Warrior', description: 'Complete 10 focus sessions', icon: 'target', progress: 0, target: 10, category: 'focus' },
      { id: 'learning-legend', name: 'Learning Legend', description: 'Review 100 flashcards', icon: 'book-open', progress: 0, target: 100, category: 'learning' },
      { id: 'productivity-beast', name: 'Productivity Beast', description: 'Complete 50 tasks', icon: 'check-circle', progress: 0, target: 50, category: 'productivity' },
      { id: 'streak-king', name: 'Streak King', description: 'Maintain a 7-day streak', icon: 'flame', progress: 0, target: 7, category: 'streak' },
      { id: 'deep-work-master', name: 'Deep Work Master', description: 'Focus for 10 hours total', icon: 'brain', progress: 0, target: 600, category: 'focus' },
      { id: 'note-taker', name: 'Note Taker', description: 'Create 25 notes', icon: 'edit', progress: 0, target: 25, category: 'learning' },
      { id: 'early-bird', name: 'Early Bird', description: 'Complete a focus session before 8 AM', icon: 'sunrise', progress: 0, target: 1, category: 'streak' },
      { id: 'night-owl', name: 'Night Owl', description: 'Complete a focus session after 10 PM', icon: 'moon', progress: 0, target: 1, category: 'streak' },
    ];
    for (const achievement of defaultAchievements) {
      await achievementsOps.add(achievement);
    }
  }
}