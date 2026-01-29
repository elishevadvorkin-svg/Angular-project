// מודל פרויקט - מגדיר את המבנה של פרויקט
export interface Project {
  id: number;               // מזהה ייחודי של הפרויקט
  teamId: number;           // מזהה הצוות שהפרויקט שייך אליו
  name: string;             // שם הפרויקט
  description?: string;     // תיאור הפרויקט (אופציונלי)
  createdAt?: string;       // תאריך יצירה
  teamName?: string;        // שם הצוות (מגיע לפעמים מהשרת)
  taskCount?: number;       // מספר משימות בפרויקט (מגיע מהשרת)
}

// נתונים ליצירת פרויקט חדש
export interface CreateProjectRequest {
  teamId: number;           // מזהה הצוות ליצור בו את הפרויקט
  name: string;             // שם הפרויקט
  description?: string;     // תיאור (אופציונלי)
}
