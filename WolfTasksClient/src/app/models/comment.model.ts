// מודל תגובה - מגדיר את המבנה של תגובה למשימה
export interface Comment {
  id: number;               // מזהה ייחודי של התגובה
  taskId: number;           // מזהה המשימה שהתגובה שייכת אליה
  userId: number;           // מזהה המשתמש שכתב את התגובה
  body: string;             // תוכן התגובה
  createdAt?: string;       // תאריך יצירה
  userName?: string;        // שם המשתמש (מגיע לפעמים מהשרת)
}

// נתונים ליצירת תגובה חדשה
export interface CreateCommentRequest {
  taskId: number;           // מזהה המשימה
  body: string;             // תוכן התגובה
}
