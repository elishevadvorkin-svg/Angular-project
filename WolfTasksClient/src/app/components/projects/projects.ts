import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProjectsService } from '../../services/projects.service';
import { TeamsService } from '../../services/teams.service';
import { Project, Team } from '../../models';

/**
 * ProjectsComponent - מסך ניהול פרויקטים
 * 
 * מה המסך מכיל:
 * 1. רשימת הפרויקטים של הצוות
 * 2. טופס ליצירת פרויקט חדש
 * 3. אפשרות למחוק פרויקט
 * 4. אפשרות לנווט למשימות של הפרויקט
 */
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class ProjectsComponent implements OnInit {
  // Dependency Injection עם inject()
  private projectsService = inject(ProjectsService);
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // מזהה הצוות (מתוך ה-URL)
  teamId!: number;
  
  // Signals לניהול state
  team = signal<Team | null>(null);
  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showCreateForm = signal<boolean>(false);
  showEditForm = signal<boolean>(false);
  editingProject = signal<Project | null>(null);
  
  // אובייקט לטופס יצירת פרויקט
  newProject = {
    name: '',
    description: ''
  };

  // אובייקט לטופס עריכת פרויקט
  editProject = {
    name: '',
    description: ''
  };

  /**
   * מתבצע כשהקומפוננטה נטענת
   * קורא את teamId מה-URL וטוען את הנתונים
   */
  ngOnInit(): void {
    // קבלת teamId מהפרמטרים של ה-route
    this.route.params.subscribe(params => {
      this.teamId = +params['teamId']; // המרה למספר
      this.loadProjects();
    });
  }

  /**
   * טעינת רשימת הפרויקטים של הצוות
   */
  loadProjects(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.projectsService.getProjectsByTeam(this.teamId).subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
        console.log('Projects loaded:', projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.errorMessage.set('שגיאה בטעינת הפרויקטים');
        this.loading.set(false);
      }
    });
  }

  /**
   * יצירת פרויקט חדש
   */
  onCreateProject(): void {
    if (!this.newProject.name || this.newProject.name.length < 2) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    // הוספת teamId לנתוני הטופס
    const projectData = {
      teamId: this.teamId,
      name: this.newProject.name,
      description: this.newProject.description
    };

    this.projectsService.createProject(this.teamId, projectData).subscribe({
      next: (newProject) => {
        console.log('Project created:', newProject);
        this.projects.set([...this.projects(), newProject]); // הוספת הפרויקט החדש לרשימה
        this.newProject = { name: '', description: '' }; // ניקוי הטופס
        this.showCreateForm.set(false); // סגירת הטופס
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה ביצירת הפרויקט');
        this.loading.set(false);
      }
    });
  }

  /**
   * מחיקת פרויקט
   */
  onDeleteProject(projectId: number): void {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) {
      return;
    }

    this.projectsService.deleteProject(projectId).subscribe({
      next: () => {
        console.log('Project deleted:', projectId);
        // הסרת הפרויקט מהרשימה
        this.projects.set(this.projects().filter(project => project.id !== projectId));
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה במחיקת הפרויקט');
      }
    });
  }

  /**
   * פתיחת טופס עריכת פרויקט
   */
  onEditProject(project: Project): void {
    this.editingProject.set(project);
    this.editProject = {
      name: project.name,
      description: project.description || ''
    };
    this.showEditForm.set(true);
    this.showCreateForm.set(false);
    this.errorMessage.set('');
  }

  /**
   * שמירת עריכת פרויקט
   */
  onSaveEdit(): void {
    const project = this.editingProject();
    if (!project || !this.editProject.name || this.editProject.name.length < 2) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.projectsService.updateProject(project.id, this.editProject).subscribe({
      next: (updatedProject) => {
        console.log('Project updated:', updatedProject);
        // עדכון הפרויקט ברשימה
        this.projects.set(
          this.projects().map(p => p.id === updatedProject.id ? updatedProject : p)
        );
        this.showEditForm.set(false);
        this.editingProject.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating project:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה בעדכון הפרויקט');
        this.loading.set(false);
      }
    });
  }

  /**
   * ביטול עריכת פרויקט
   */
  onCancelEdit(): void {
    this.showEditForm.set(false);
    this.editingProject.set(null);
    this.editProject = { name: '', description: '' };
    this.errorMessage.set('');
  }

  /**
   * מעבר לעמוד המשימות של הפרויקט
   */
  viewTasks(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'tasks']);
  }

  /**
   * חזרה לעמוד הצוותים
   */
  goBackToTeams(): void {
    this.router.navigate(['/teams']);
  }

  /**
   * החלפת מצב הצגת טופס יצירת הפרויקט
   */
  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    if (!this.showCreateForm()) {
      this.newProject = { name: '', description: '' };
      this.errorMessage.set('');
    }
  }
}
