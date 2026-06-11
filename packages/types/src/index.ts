// AI & Conversation
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Finances
export interface Transaction {
  id: string;
  amount: number; // in cents or standard decimal
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  accountId: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment';
  balance: number;
  currency: string;
}

// Goals
export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'BRL', 'kg', 'books'
  deadline?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// Habits
export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  frequencyDays?: number[]; // e.g. [1, 3, 5] for Mon, Wed, Fri
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  notes?: string;
}

// Projects & Productivity
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  dueDate?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
}
