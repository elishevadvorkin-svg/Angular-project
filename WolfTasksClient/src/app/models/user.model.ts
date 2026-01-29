// מודל משתמש - מגדיר את המבנה של משתמש במערכת
export interface User {
  id: number;           // מזהה ייחודי של המשתמש
  name: string;         // שם המשתמש
  email: string;        // כתובת אימייל
}

// תשובת התחברות/הרשמה - מה שהשרת מחזיר
export interface AuthResponse {
  token: string;        // JWT Token לאימות
  user: User;           // פרטי המשתמש
}

// נתוני התחברות - מה ששולחים לשרת
export interface LoginRequest {
  email: string;
  password: string;
}

// נתוני הרשמה - מה ששולחים לשרת
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
