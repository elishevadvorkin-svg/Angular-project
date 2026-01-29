import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '../models';

/**
 * TasksService - שירות לניהול משימות
 * 
 * מה השירות עושה:
 * 1. מביא רשימת משימות של פרויקט מסוים
 * 2. יוצר משימה חדשה
 * 3. מעדכן משימה קיימת (שינוי סטטוס, תיאור וכו')
 * 4. מוחק משימה
 * 5. מוסיף תגובה למשימה
 * 
 * כל הפעולות משתמשות ב-HttpClient ומחזירות Observable
 */
@Injectable({
  providedIn: 'root' // Singleton - מופע אחד לכל האפליקציה
})
export class TasksService {
  // כתובת ה-API בשרת
  private apiUrl = 'https://wolf-tasks-api.onrender.com/api';

  // Dependency Injection עם inject()
  private http = inject(HttpClient);

  /**
   * המרת snake_case ל-camelCase
   * השרת מחזיר project_id, assignee_id, due_date וכו'
   * אנחנו צריכים projectId, assignedTo, dueDate
   */
  private convertToCamelCase(task: any): Task {
    return {
      id: task.id,
      projectId: task.projectId || task.project_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || task.assignee_id || task.assigneeId,
      dueDate: task.dueDate || task.due_date,
      createdAt: task.createdAt || task.created_at,
      updatedAt: task.updatedAt || task.updated_at
    };
  }

  /**
   * קבלת כל המשימות של פרויקט מסוים
   * GET /api/tasks?projectId=X
   * 
   * @param projectId - מזהה הפרויקט
   */
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks?projectId=${projectId}`).pipe(
      map(tasks => tasks.map(t => this.convertToCamelCase(t)))
    );
  }

  /**
   * קבלת משימה ספציפית לפי ID
   * GET /api/tasks/:id
   * 
   * @param taskId - מזהה המשימה
   */
  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<any>(`${this.apiUrl}/tasks/${taskId}`).pipe(
      map(task => this.convertToCamelCase(task))
    );
  }

  /**
   * יצירת משימה חדשה
   * POST /api/tasks
   * 
   * @param projectId - מזהה הפרויקט
   * @param taskData - נתוני המשימה
   */
  createTask(projectId: number, taskData: CreateTaskRequest): Observable<Task> {
    // המרה ל-snake_case לשרת
    const serverData = {
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigneeId: taskData.assignedTo,
      dueDate: taskData.dueDate
    };
    return this.http.post<any>(`${this.apiUrl}/tasks`, serverData).pipe(
      map(task => this.convertToCamelCase(task))
    );
  }

  /**
   * עדכון משימה קיימת
   * PATCH /api/tasks/:id
   * 
   * @param taskId - מזהה המשימה
   * @param taskData - נתונים מעודכנים
   */
  updateTask(taskId: number, taskData: UpdateTaskRequest): Observable<Task> {
    // המרה ל-snake_case לשרת
    const serverData: any = {};
    if (taskData.title !== undefined) serverData.title = taskData.title;
    if (taskData.description !== undefined) serverData.description = taskData.description;
    if (taskData.status !== undefined) serverData.status = taskData.status;
    if (taskData.priority !== undefined) serverData.priority = taskData.priority;
    if (taskData.assignedTo !== undefined) serverData.assignee_id = taskData.assignedTo;
    if (taskData.dueDate !== undefined) serverData.due_date = taskData.dueDate;
    
    return this.http.patch<any>(`${this.apiUrl}/tasks/${taskId}`, serverData).pipe(
      map(task => this.convertToCamelCase(task))
    );
  }

  /**
   * מחיקת משימה
   * DELETE /api/tasks/:id
   * 
   * @param taskId - מזהה המשימה למחיקה
   */
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }

  /**
   * שינוי סטטוס משימה (TODO/IN_PROGRESS/DONE)
   * PUT /api/tasks/:id
   * 
   * @param taskId - מזהה המשימה
   * @param status - הסטטוס החדש
   */
  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    return this.updateTask(taskId, { status });
  }

  /**
   * שינוי עדיפות משימה (LOW/MEDIUM/HIGH)
   * PUT /api/tasks/:id
   * 
   * @param taskId - מזהה המשימה
   * @param priority - העדיפות החדשה
   */
  updateTaskPriority(taskId: number, priority: TaskPriority): Observable<Task> {
    return this.updateTask(taskId, { priority });
  }
}
