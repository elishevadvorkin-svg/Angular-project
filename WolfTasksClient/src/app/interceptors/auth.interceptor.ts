import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor - מיירט HTTP שמוסיף JWT Token לכל בקשה
 * 
 * זהו Functional Interceptor (Angular 20 - הגרסה החדשה)
 * 
 * איך זה עובד?
 * 1. תופס כל בקשת HTTP שיוצאת מהאפליקציה
 * 2. בודק אם יש Token ב-localStorage
 * 3. אם יש - מוסיף אותו לכותרת Authorization
 * 4. שולח את הבקשה הלאה עם ה-Token
 * 
 * פורמט הכותרת: Authorization: Bearer <token>
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // שלב 1: קבלת ה-Token מ-localStorage
  const token = localStorage.getItem('token');

  // שלב 2: אם אין Token - שולחים את הבקשה כרגיל בלי שינוי
  if (!token) {
    return next(req);
  }

  // שלב 3: יצירת בקשה חדשה עם ה-Token בכותרת
  // req.clone() יוצר עותק של הבקשה המקורית עם שינויים
  const authReq = req.clone({
    // setHeaders מוסיף/משנה כותרות בבקשה
    setHeaders: {
      // Authorization: כותרת סטנדרטית לאימות
      // Bearer: הסוג של ה-Token (JWT Token)
      Authorization: `Bearer ${token}`
    }
  });

  // שלב 4: שולחים את הבקשה המעודכנת הלאה
  return next(authReq);
};
