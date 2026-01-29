import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';

/**
 * שירות אימות - מטפל בכל הפעולות הקשורות להתחברות והרשמה
 * 
 * תפקידי השירות:
 * 1. התחברות והרשמה
 * 2. שמירת ה-JWT Token ב-localStorage
 * 3. שמירת פרטי המשתמש המחובר
 * 4. בדיקה אם משתמש מחובר
 * 5. התנתקות
 */
@Injectable({
  providedIn: 'root'  // השירות זמין בכל האפליקציה
})
export class AuthService {
  // כתובת ה-API של השרת
  private apiUrl = 'https://angular-project-4qdz.onrender.com/api/auth';

  // Dependency Injection עם inject()
  private http = inject(HttpClient);

  // BehaviorSubject - שומר את המשתמש הנוכחי ומאפשר לקומפוננטות להירשם לשינויים
  // null = אין משתמש מחובר
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Observable שקומפוננטות יכולות להירשם אליו כדי לדעת מתי המשתמש משתנה
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // בעת טעינת השירות, בודק אם יש משתמש שמור מהפעם הקודמת
    this.loadUserFromStorage();
  }

  /**
   * טוען את פרטי המשתמש מ-localStorage אם קיימים
   * נקרא אוטומטית כשהשירות נטען (בעת רענון הדף)
   */
  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('שגיאה בטעינת משתמש:', error);
        this.clearStorage();
      }
    }
  }

  /**
   * רישום משתמש חדש
   * @param request - פרטי ההרשמה (name, email, password)
   * @returns Observable עם התשובה מהשרת (token + user)
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  /**
   * התחברות משתמש קיים
   * @param request - פרטי ההתחברות (email, password)
   * @returns Observable עם התשובה מהשרת (token + user)
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  /**
   * מטפל בתשובה מהשרת אחרי התחברות/הרשמה מוצלחת
   * שומר את ה-Token ואת פרטי המשתמש
   */
  private handleAuthResponse(response: AuthResponse): void {
    // שומר את ה-Token ב-localStorage
    localStorage.setItem('token', response.token);
    
    // שומר את פרטי המשתמש ב-localStorage
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    
    // מעדכן את ה-BehaviorSubject עם המשתמש החדש
    // כל מי שמאזין ל-currentUser$ יקבל עדכון
    this.currentUserSubject.next(response.user);
  }

  /**
   * התנתקות - מוחק את כל המידע השמור
   */
  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  /**
   * מנקה את ה-localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  /**
   * מחזיר את ה-JWT Token
   * @returns Token או null אם לא קיים
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * בודק אם יש משתמש מחובר
   * @returns true אם יש token, false אם לא
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * מחזיר את המשתמש הנוכחי
   * @returns אובייקט User או null
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
