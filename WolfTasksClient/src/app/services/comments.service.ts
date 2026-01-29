import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment, CreateCommentRequest } from '../models';

/**
 * CommentsService - שירות לניהול תגובות
 * 
 * מה השירות עושה:
 * 1. מביא תגובות של משימה
 * 2. יוצר תגובה חדשה
 * 
 * כל הפעולות משתמשות ב-HttpClient ומחזירות Observable
 */
@Injectable({
  providedIn: 'root' // Singleton - מופע אחד לכל האפליקציה
})
export class CommentsService {
  // כתובת ה-API בשרת
  private apiUrl = 'https://angular-project-4qdz.onrender.com/api';

  // Dependency Injection עם inject()
  private http = inject(HttpClient);

  /**
   * המרת snake_case ל-camelCase
   * השרת מחזיר task_id, user_id, created_at וכו'
   * אנחנו צריכים taskId, userId, createdAt
   */
  private convertToCamelCase(comment: any): Comment {
    return {
      id: comment.id,
      taskId: comment.taskId || comment.task_id,
      userId: comment.userId || comment.user_id,
      body: comment.body,
      userName: comment.userName || comment.author_name,
      createdAt: comment.createdAt || comment.created_at
    };
  }

  /**
   * קבלת כל התגובות של משימה
   * GET /api/comments?taskId=X
   * 
   * @param taskId - מזהה המשימה
   */
  getCommentsByTask(taskId: number): Observable<Comment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments?taskId=${taskId}`).pipe(
      map(comments => comments.map(c => this.convertToCamelCase(c)))
    );
  }

  /**
   * יצירת תגובה חדשה
   * POST /api/comments
   * 
   * @param commentData - נתוני התגובה
   */
  createComment(commentData: CreateCommentRequest): Observable<Comment> {
    return this.http.post<any>(`${this.apiUrl}/comments`, commentData).pipe(
      map(comment => this.convertToCamelCase(comment))
    );
  }
}
