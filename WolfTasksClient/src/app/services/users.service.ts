import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * User - מודל משתמש פשוט (רק id ושם)
 */
export interface User {
  id: number;
  name: string;
}

/**
 * UsersService - שירות לניהול משתמשים
 * 
 * מה השירות עושה:
 * 1. מביא רשימת כל המשתמשים (לשיוך לצוותים ומשימות)
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';
  private http = inject(HttpClient);

  /**
   * קבלת רשימת כל המשתמשים
   * GET /api/users
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
