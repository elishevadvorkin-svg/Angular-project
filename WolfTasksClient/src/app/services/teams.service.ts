import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, CreateTeamRequest, AddMemberRequest } from '../models';

/**
 * TeamsService - שירות לניהול צוותים
 * 
 * מה השירות עושה:
 * 1. מביא רשימת צוותים מהשרת
 * 2. יוצר צוות חדש
 * 3. מוסיף חבר לצוות
 * 4. מוחק צוות
 * 
 * כל הפעולות משתמשות ב-HttpClient ומחזירות Observable
 */
@Injectable({
  providedIn: 'root' // Singleton - מופע אחד לכל האפליקציה
})
export class TeamsService {
  // כתובת ה-API בשרת
  private apiUrl = 'http://localhost:3000/api/teams';

  // Dependency Injection עם inject()
  private http = inject(HttpClient);

  /**
   * קבלת כל הצוותים של המשתמש המחובר
   * GET /api/teams
   */
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  /**
   * יצירת צוות חדש
   * POST /api/teams
   * 
   * @param teamData - שם הצוות
   */
  createTeam(teamData: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, teamData);
  }

  /**
   * הוספת חבר לצוות
   * POST /api/teams/:teamId/members
   * 
   * @param teamId - מזהה הצוות
   * @param userId - מזהה המשתמש להוסיף
   */
  addMember(teamId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/members`, { userId });
  }

  /**
   * קבלת רשימת חברי צוות
   * GET /api/teams/:teamId/members
   * 
   * @param teamId - מזהה הצוות
   */
  getTeamMembers(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${teamId}/members`);
  }

  /**
   * מחיקת צוות
   * DELETE /api/teams/:id
   * 
   * @param teamId - מזהה הצוות למחיקה
   */
  deleteTeam(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}`);
  }

  /**
   * הסרת חבר מהצוות
   * DELETE /api/teams/:teamId/members/:userId
   * 
   * @param teamId - מזהה הצוות
   * @param userId - מזהה המשתמש להסרה
   */
  removeMember(teamId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
