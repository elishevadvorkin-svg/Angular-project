import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, CreateProjectRequest } from '../models';

/**
 * ProjectsService - שירות לניהול פרויקטים
 * 
 * מה השירות עושה:
 * 1. מביא רשימת פרויקטים של צוות מסוים
 * 2. יוצר פרויקט חדש
 * 3. מוחק פרויקט
 * 4. מעדכן פרויקט
 * 
 * כל הפעולות משתמשות ב-HttpClient ומחזירות Observable
 */
@Injectable({
  providedIn: 'root' // Singleton - מופע אחד לכל האפליקציה
})
export class ProjectsService {
  // כתובת ה-API בשרת
  private apiUrl = 'https://angular-project-4qdz.onrender.com/api';

  // Dependency Injection עם inject()
  private http = inject(HttpClient);

  /**
   * המרת snake_case ל-camelCase
   * השרת מחזיר team_id, created_at וכו'
   * אנחנו צריכים teamId, createdAt
   */
  private convertToCamelCase(project: any): Project {
    return {
      id: project.id,
      teamId: project.teamId || project.team_id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt || project.created_at
    };
  }

  /**
   * קבלת כל הפרויקטים של צוות מסוים
   * GET /api/projects (מסנן בצד לקוח)
   * 
   * @param teamId - מזהה הצוות
   */
  getProjectsByTeam(teamId: number): Observable<Project[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`).pipe(
      map(projects => projects
        .map(p => this.convertToCamelCase(p))
        .filter(p => p.teamId === teamId)
      )
    );
  }

  /**
   * קבלת פרויקט ספציפי לפי ID
   * GET /api/projects ומסנן לפי ID
   * 
   * @param projectId - מזהה הפרויקט
   */
  getProjectById(projectId: number): Observable<Project | null> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`).pipe(
      map(projects => {
        const project = projects.find(p => p.id === projectId);
        return project ? this.convertToCamelCase(project) : null;
      })
    );
  }

  /**
   * יצירת פרויקט חדש
   * POST /api/projects
   * 
   * @param teamId - מזהה הצוות
   * @param projectData - נתוני הפרויקט (שם ותיאור)
   */
  createProject(teamId: number, projectData: CreateProjectRequest): Observable<Project> {
    return this.http.post<any>(`${this.apiUrl}/projects`, projectData).pipe(
      map(project => this.convertToCamelCase(project))
    );
  }

  /**
   * עדכון פרויקט קיים
   * PATCH /api/projects/:projectId
   * 
   * @param projectId - מזהה הפרויקט
   * @param projectData - נתונים מעודכנים
   */
  updateProject(projectId: number, projectData: Partial<CreateProjectRequest>): Observable<Project> {
    return this.http.patch<any>(`${this.apiUrl}/projects/${projectId}`, projectData).pipe(
      map(project => this.convertToCamelCase(project))
    );
  }

  /**
   * מחיקת פרויקט
   * DELETE /api/projects/:id
   * 
   * @param projectId - מזהה הפרויקט למחיקה
   */
  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }
}
