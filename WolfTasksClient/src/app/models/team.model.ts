// מודל צוות - מגדיר את המבנה של צוות
export interface Team {
  id: number;               // מזהה ייחודי של הצוות
  name: string;             // שם הצוות
  createdAt?: string;       // תאריך יצירה
  memberCount?: number;     // מספר חברים בצוות (מגיע מהשרת)
  ownerId?: number;         // מזהה בעל הצוות (נשמר בצד הלקוח)
}

// נתונים ליצירת צוות חדש
export interface CreateTeamRequest {
  name: string;             // שם הצוות החדש
}

// חבר צוות
export interface TeamMember {
  id: number;               // מזהה החברות
  teamId: number;           // מזהה הצוות
  userId: number;           // מזהה המשתמש
  role: string;             // תפקיד בצוות (owner/member)
  joinedAt?: string;        // תאריך הצטרפות
}

// נתונים להוספת חבר לצוות
export interface AddMemberRequest {
  userId: number;           // מזהה המשתמש להוסיף
  role: string;             // התפקיד שלו (owner/member)
}
