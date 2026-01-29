// מודל משימה - מגדיר את המבנה של משימה
export interface Task {
  id: number;                   // מזהה ייחודי של המשימה
  projectId: number;            // מזהה הפרויקט שהמשימה שייכת אליו
  title: string;                // כותרת המשימה
  description?: string;         // תיאור מפורט (אופציונלי)
  status: TaskStatus;           // סטטוס המשימה
  priority?: TaskPriority;      // עדיפות (אופציונלי)
  assignedTo?: number;          // מזהה משתמש שמשויך למשימה (אופציונלי)
  dueDate?: string;             // תאריך יעד (אופציונלי)
  createdAt?: string;           // תאריך יצירה
  updatedAt?: string;           // תאריך עדכון אחרון
}

// סטטוס משימה - סוגי הסטטוסים האפשריים
export enum TaskStatus {
  TODO = 'todo',                // לביצוע
  IN_PROGRESS = 'in_progress',  // בתהליך
  DONE = 'done'                 // הושלם
}

// עדיפות משימה - רמות העדיפות
export enum TaskPriority {
  LOW = 'low',                  // נמוכה
  NORMAL = 'normal',            // רגילה
  HIGH = 'high'                 // גבוהה
}

// נתונים ליצירת משימה חדשה
export interface CreateTaskRequest {
  projectId: number;            // מזהה הפרויקט
  title: string;                // כותרת
  description?: string;         // תיאור
  status?: TaskStatus;          // סטטוס (ברירת מחדל: TODO)
  priority?: TaskPriority;      // עדיפות
  assignedTo?: number;          // משתמש משויך
  dueDate?: string;             // תאריך יעד
}

// נתונים לעדכון משימה
export interface UpdateTaskRequest {
  title?: string;               // כל השדות אופציונליים
  description?: string;         // ניתן לעדכן חלק מהם
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: number;
  dueDate?: string;
}
