import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - שומר שמגן על routes
 * 
 * זהו Functional Guard (Angular 20 - הגרסה החדשה)
 * 
 * איך זה עובד?
 * 1. כשמשתמש מנסה להיכנס לדף מוגן
 * 2. ה-Guard בודק אם יש לו Token (= מחובר)
 * 3. אם כן ✅ - מאפשר כניסה (return true)
 * 4. אם לא ❌ - מעביר לדף התחברות (return false)
 * 
 * שימוש:
 * בקובץ routes, מוסיפים: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = (route, state) => {
  // inject - דרך חדשה להזריק שירותים ב-Angular 20
  const authService = inject(AuthService);
  const router = inject(Router);

  // בודק אם המשתמש מחובר
  if (authService.isLoggedIn()) {
    // יש Token - מאפשר כניסה לדף
    return true;
  }

  // אין Token - מעביר לדף התחברות
  // state.url = הדף שהמשתמש ניסה להיכנס אליו
  // אפשר להשתמש בזה כדי להחזיר אותו לאחר ההתחברות
  console.log('User not authenticated. Redirecting to login...');
  
  // navigate - מעביר לדף /login
  router.navigate(['/login']);
  
  // מחזיר false = חוסם כניסה לדף המקורי
  return false;
};
