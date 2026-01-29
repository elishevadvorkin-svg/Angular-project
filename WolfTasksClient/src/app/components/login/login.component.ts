import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest } from '../../models';

/**
 * LoginComponent - מסך התחברות והרשמה
 * 
 * מה המסך מכיל:
 * 1. שני טפסים - התחברות והרשמה (Template-driven Forms)
 * 2. כפתור להחלפה בין המצבים
 * 3. טיפול בשגיאות
 * 4. העברה לדף הבית אחרי התחברות מוצלחת
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // Template-driven Forms
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Dependency Injection עם inject()
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals לניהול state
  isLoginMode = signal<boolean>(true);
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);

  // אובייקטים לטפסים
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };

  /**
   * החלפה בין מצב התחברות למצב הרשמה
   */
  switchMode(): void {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set(''); // מנקה שגיאות קודמות
  }

  /**
   * טיפול בהתחברות
   */
  onLogin(): void {
    console.log('onLogin called');
    console.log('Login data:', this.loginData);
    
    this.loading.set(true);
    this.errorMessage.set('');

    // שליחת בקשת התחברות לשרת דרך AuthService
    this.authService.login(this.loginData).subscribe({
      // במקרה של הצלחה
      next: (response) => {
        console.log('Login successful:', response);
        this.loading.set(false);
        
        // מעביר לדף הצוותים (הדף הראשי)
        console.log('Navigating to /teams');
        this.router.navigate(['/teams']);
      },
      // במקרה של שגיאה
      error: (error) => {
        console.error('Login error:', error);
        this.loading.set(false);
        
        // הצגת הודעת שגיאה למשתמש
        this.errorMessage.set(error.error?.error || 'התחברות נכשלה. אנא בדוק את הפרטים.');
      }
    });
  }

  /**
   * טיפול בהרשמה
   */
  onRegister(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // שליחת בקשת הרשמה לשרת דרך AuthService
    this.authService.register(this.registerData).subscribe({
      // במקרה של הצלחה
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading.set(false);
        
        // מעביר לדף הצוותים
        this.router.navigate(['/teams']);
      },
      // במקרה של שגיאה
      error: (error) => {
        console.error('Registration error:', error);
        this.loading.set(false);
        
        // הצגת הודעת שגיאה למשתמש
        this.errorMessage.set(error.error?.error || 'הרשמה נכשלה. אנא נסה שוב.');
      }
    });
  }
}
