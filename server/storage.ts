import { 
  users, subjects, studySessions, dailyGoals, todos, playlists, settings,
  type User, type InsertUser, type Subject, type InsertSubject,
  type StudySession, type InsertStudySession, type DailyGoal, type InsertDailyGoal,
  type Todo, type InsertTodo, type Playlist, type InsertPlaylist,
  type Setting, type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: number): Promise<void>;
  
  // Study Sessions
  getStudySessions(): Promise<(StudySession & { subject: Subject })[]>;
  getStudySession(id: number): Promise<StudySession | undefined>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getStudySessionsByDateRange(startDate: Date, endDate: Date): Promise<(StudySession & { subject: Subject })[]>;
  
  // Daily Goals
  getDailyGoals(): Promise<DailyGoal[]>;
  getDailyGoal(date: string): Promise<DailyGoal | undefined>;
  createDailyGoal(goal: InsertDailyGoal): Promise<DailyGoal>;
  updateDailyGoal(date: string, goal: Partial<InsertDailyGoal>): Promise<DailyGoal>;
  
  // Todos
  getTodos(): Promise<(Todo & { subject: Subject })[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
  
  // Playlists
  getPlaylists(): Promise<(Playlist & { subject: Subject })[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;
  
  // Settings
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Analytics
  getAnalyticsSummary(): Promise<{ subject: string; totalMinutes: number; color: string }[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(subjects.name);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject || undefined;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values(subject).returning();
    return newSubject;
  }

  async updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject> {
    const [updatedSubject] = await db.update(subjects)
      .set(subject)
      .where(eq(subjects.id, id))
      .returning();
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Study Sessions
  async getStudySessions(): Promise<(StudySession & { subject: Subject })[]> {
    return await db.select({
      id: studySessions.id,
      subjectId: studySessions.subjectId,
      duration: studySessions.duration,
      notes: studySessions.notes,
      date: studySessions.date,
      subject: {
        id: subjects.id,
        name: subjects.name,
        color: subjects.color,
        createdAt: subjects.createdAt,
      }
    })
    .from(studySessions)
    .innerJoin(subjects, eq(studySessions.subjectId, subjects.id))
    .orderBy(desc(studySessions.date));
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return session || undefined;
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values(session).returning();
    return newSession;
  }

  async getStudySessionsByDateRange(startDate: Date, endDate: Date): Promise<(StudySession & { subject: Subject })[]> {
    return await db.select({
      id: studySessions.id,
      subjectId: studySessions.subjectId,
      duration: studySessions.duration,
      notes: studySessions.notes,
      date: studySessions.date,
      subject: {
        id: subjects.id,
        name: subjects.name,
        color: subjects.color,
        createdAt: subjects.createdAt,
      }
    })
    .from(studySessions)
    .innerJoin(subjects, eq(studySessions.subjectId, subjects.id))
    .where(and(
      gte(studySessions.date, startDate),
      lte(studySessions.date, endDate)
    ))
    .orderBy(desc(studySessions.date));
  }

  // Daily Goals
  async getDailyGoals(): Promise<DailyGoal[]> {
    return await db.select().from(dailyGoals).orderBy(desc(dailyGoals.date));
  }

  async getDailyGoal(date: string): Promise<DailyGoal | undefined> {
    const [goal] = await db.select().from(dailyGoals).where(eq(dailyGoals.date, date));
    return goal || undefined;
  }

  async createDailyGoal(goal: InsertDailyGoal): Promise<DailyGoal> {
    const [newGoal] = await db.insert(dailyGoals).values(goal).returning();
    return newGoal;
  }

  async updateDailyGoal(date: string, goal: Partial<InsertDailyGoal>): Promise<DailyGoal> {
    const [updatedGoal] = await db.update(dailyGoals)
      .set(goal)
      .where(eq(dailyGoals.date, date))
      .returning();
    return updatedGoal;
  }

  // Todos
  async getTodos(): Promise<(Todo & { subject: Subject })[]> {
    return await db.select({
      id: todos.id,
      subjectId: todos.subjectId,
      task: todos.task,
      status: todos.status,
      dueDate: todos.dueDate,
      createdAt: todos.createdAt,
      subject: {
        id: subjects.id,
        name: subjects.name,
        color: subjects.color,
        createdAt: subjects.createdAt,
      }
    })
    .from(todos)
    .innerJoin(subjects, eq(todos.subjectId, subjects.id))
    .orderBy(todos.dueDate, todos.createdAt);
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    return todo || undefined;
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [newTodo] = await db.insert(todos).values(todo).returning();
    return newTodo;
  }

  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo> {
    const [updatedTodo] = await db.update(todos)
      .set(todo)
      .where(eq(todos.id, id))
      .returning();
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }

  // Playlists
  async getPlaylists(): Promise<(Playlist & { subject: Subject })[]> {
    return await db.select({
      id: playlists.id,
      subjectId: playlists.subjectId,
      name: playlists.name,
      url: playlists.url,
      createdAt: playlists.createdAt,
      subject: {
        id: subjects.id,
        name: subjects.name,
        color: subjects.color,
        createdAt: subjects.createdAt,
      }
    })
    .from(playlists)
    .innerJoin(subjects, eq(playlists.subjectId, subjects.id))
    .orderBy(playlists.name);
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist> {
    const [updatedPlaylist] = await db.update(playlists)
      .set(playlist)
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  // Settings
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db.insert(settings).values(setting).returning();
    return newSetting;
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const [updatedSetting] = await db.update(settings)
      .set({ value })
      .where(eq(settings.key, key))
      .returning();
    return updatedSetting;
  }

  // Analytics
  async getAnalyticsSummary(): Promise<{ subject: string; totalMinutes: number; color: string }[]> {
    const result = await db.select({
      subject: subjects.name,
      totalMinutes: sql<number>`sum(${studySessions.duration})`.mapWith(Number),
      color: subjects.color,
    })
    .from(studySessions)
    .innerJoin(subjects, eq(studySessions.subjectId, subjects.id))
    .groupBy(subjects.id, subjects.name, subjects.color)
    .orderBy(sql`sum(${studySessions.duration}) desc`);
    
    return result;
  }
}

export const storage = new DatabaseStorage();
