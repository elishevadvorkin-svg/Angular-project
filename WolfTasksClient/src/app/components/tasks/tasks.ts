import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TasksService } from '../../services/tasks.service';
import { ProjectsService } from '../../services/projects.service';
import { CommentsService } from '../../services/comments.service';
import { TeamsService } from '../../services/teams.service';
import { Task, Project, TaskStatus, TaskPriority, Comment } from '../../models';
import { User } from '../../services/users.service';

/**
 * TasksComponent - לוח ניהול משימות (Kanban Board)
 * 
 * מה המסך מכיל:
 * 1. לוח משימות מחולק לעמודות לפי סטטוס (TODO, IN_PROGRESS, DONE)
 * 2. יכולת ליצור משימה חדשה
 * 3. יכולת לערוך משימה
 * 4. יכולת למחוק משימה
 * 5. יכולת לשנות סטטוס ועדיפות
 * 6. יכולת לצפות ולהוסיף תגובות למשימה
 * 7. יכולת לשייך משימה לחבר צוות
 */
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent implements OnInit {
  // Dependency Injection עם inject()
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);
  private commentsService = inject(CommentsService);
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // מזהה הפרויקט (מתוך ה-URL)
  projectId!: number;
  
  // מזהה הצוות (לצורך חזרה)
  teamId: number = 0;
  
  // Signals לניהול state
  project = signal<Project | null>(null);
  allTasks = signal<Task[]>([]);
  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showTaskForm = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingTask = signal<Task | null>(null);
  
  // Signals לניהול תגובות
  showCommentsModal = signal<boolean>(false);
  selectedTask = signal<Task | null>(null);
  comments = signal<Comment[]>([]);
  newCommentBody = '';
  loadingComments = signal<boolean>(false);
  
  // רשימת חברי הצוות (לשיוך משימות)
  teamMembers = signal<User[]>([]);
  
  // אובייקט לטופס משימה
  newTask = {
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.NORMAL,
    assignedTo: 0,
    dueDate: ''
  };
  
  // Enums לשימוש ב-template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  /**
   * מתבצע כשהקומפוננטה נטענת
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      this.loadProjectDetails();
      this.loadTasks();
    });
  }

  /**
   * טעינת פרטי הפרויקט
   */
  loadProjectDetails(): void {
    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project.set(project);
        if (project) {
          this.teamId = project.teamId;
          this.loadTeamMembers(project.teamId);
        }
        console.log('Project loaded:', project);
      },
      error: (error) => {
        console.error('Error loading project:', error);
      }
    });
  }

  /**
   * טעינת חברי הצוות
   */
  loadTeamMembers(teamId: number): void {
    this.teamsService.getTeamMembers(teamId).subscribe({
      next: (members) => {
        this.teamMembers.set(members);
        console.log('Team members loaded:', members);
      },
      error: (error) => {
        console.error('Error loading team members:', error);
      }
    });
  }

  /**
   * טעינת המשימות וחלוקה לעמודות
   */
  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.tasksService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.organizeTasks();
        this.loading.set(false);
        console.log('Tasks loaded:', tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage.set('שגיאה בטעינת המשימות');
        this.loading.set(false);
      }
    });
  }

  /**
   * ארגון המשימות לעמודות לפי סטטוס
   */
  organizeTasks(): void {
    this.todoTasks.set(this.allTasks().filter(task => task.status === TaskStatus.TODO));
    this.inProgressTasks.set(this.allTasks().filter(task => task.status === TaskStatus.IN_PROGRESS));
    this.doneTasks.set(this.allTasks().filter(task => task.status === TaskStatus.DONE));
  }

  /**
   * פתיחת טופס ליצירת משימה חדשה
   */
  openCreateForm(): void {
    this.isEditMode.set(false);
    this.editingTask.set(null);
    this.newTask = {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.NORMAL,
      assignedTo: 0,
      dueDate: ''
    };
    this.showTaskForm.set(true);
  }

  /**
   * פתיחת טופס לעריכת משימה
   */
  openEditForm(task: Task): void {
    this.isEditMode.set(true);
    this.editingTask.set(task);
    this.newTask = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || TaskPriority.NORMAL,
      assignedTo: task.assignedTo || 0,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    };
    this.showTaskForm.set(true);
  }

  /**
   * שמירת משימה (יצירה או עריכה)
   */
  onSaveTask(): void {
    if (!this.newTask.title || this.newTask.title.length < 3) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const taskData = {
      title: this.newTask.title,
      description: this.newTask.description,
      status: this.newTask.status,
      priority: this.newTask.priority,
      assignedTo: this.newTask.assignedTo || 0,
      dueDate: this.newTask.dueDate
    };

    if (this.isEditMode() && this.editingTask()) {
      // עריכת משימה קיימת
      this.tasksService.updateTask(this.editingTask()!.id, taskData).subscribe({
        next: (updatedTask) => {
          console.log('Task updated:', updatedTask);
          // עדכון המשימה ברשימה
          const tasks = this.allTasks();
          const index = tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            tasks[index] = updatedTask;
            this.allTasks.set([...tasks]);
          }
          this.organizeTasks();
          this.closeTaskForm();
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.errorMessage.set(error.error?.error || 'שגיאה בעדכון המשימה');
          this.loading.set(false);
        }
      });
    } else {
      // יצירת משימה חדשה
      const createData = {
        projectId: this.projectId,
        ...taskData
      };
      
      this.tasksService.createTask(this.projectId, createData).subscribe({
        next: (newTask) => {
          console.log('Task created:', newTask);
          this.allTasks.set([...this.allTasks(), newTask]);
          this.organizeTasks();
          this.closeTaskForm();
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.errorMessage.set(error.error?.error || 'שגיאה ביצירת המשימה');
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * מחיקת משימה
   */
  onDeleteTask(taskId: number): void {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
      return;
    }

    this.tasksService.deleteTask(taskId).subscribe({
      next: () => {
        console.log('Task deleted:', taskId);
        this.allTasks.set(this.allTasks().filter(task => task.id !== taskId));
        this.organizeTasks();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה במחיקת המשימה');
      }
    });
  }

  /**
   * שינוי סטטוס משימה
   */
  onChangeStatus(task: Task, newStatus: TaskStatus): void {
    this.tasksService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (updatedTask) => {
        console.log('Task status updated:', updatedTask);
        const tasks = this.allTasks();
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          tasks[index] = updatedTask;
          this.allTasks.set([...tasks]);
        }
        this.organizeTasks();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה בעדכון הסטטוס');
      }
    });
  }

  /**
   * סגירת טופס המשימה
   */
  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.isEditMode.set(false);
    this.editingTask.set(null);
    this.newTask = {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.NORMAL,
      assignedTo: 0,
      dueDate: ''
    };
    this.errorMessage.set('');
  }

  /**
   * חזרה לעמוד הפרויקטים
   */
  goBackToProjects(): void {
    if (this.teamId) {
      this.router.navigate(['/teams', this.teamId, 'projects']);
    } else {
      // אם אין teamId, נחזור לעמוד הצוותים
      this.router.navigate(['/teams']);
    }
  }

  /**
   * קבלת class CSS לפי עדיפות
   */
  getPriorityClass(priority: TaskPriority | undefined): string {
    if (!priority) return 'priority-normal';
    return `priority-${priority.toLowerCase()}`;
  }

  /**
   * פתיחת מודל תגובות למשימה
   */
  openCommentsModal(task: Task): void {
    this.selectedTask.set(task);
    this.showCommentsModal.set(true);
    this.newCommentBody = '';
    this.loadComments(task.id);
  }

  /**
   * טעינת תגובות למשימה
   */
  loadComments(taskId: number): void {
    this.loadingComments.set(true);
    this.commentsService.getCommentsByTask(taskId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loadingComments.set(false);
        console.log('Comments loaded:', comments);
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loadingComments.set(false);
      }
    });
  }

  /**
   * הוספת תגובה חדשה
   */
  addComment(): void {
    const task = this.selectedTask();
    if (!task || !this.newCommentBody.trim()) {
      return;
    }

    this.loadingComments.set(true);
    this.commentsService.createComment({
      taskId: task.id,
      body: this.newCommentBody.trim()
    }).subscribe({
      next: (newComment) => {
        console.log('Comment created:', newComment);
        // הוספת התגובה לרשימה
        this.comments.set([...this.comments(), newComment]);
        this.newCommentBody = ''; // ניקוי השדה
        this.loadingComments.set(false);
      },
      error: (error) => {
        console.error('Error creating comment:', error);
        this.loadingComments.set(false);
      }
    });
  }

  /**
   * סגירת מודל תגובות
   */
  closeCommentsModal(): void {
    this.showCommentsModal.set(false);
    this.selectedTask.set(null);
    this.comments.set([]);
    this.newCommentBody = '';
  }

  /**
   * קבלת שם משתמש לפי מזהה
   */
  getUserName(userId: number | undefined): string {
    if (!userId) return 'לא משויך';
    const user = this.teamMembers().find(m => m.id === userId);
    return user ? user.name : 'משתמש לא ידוע';
  }
}
