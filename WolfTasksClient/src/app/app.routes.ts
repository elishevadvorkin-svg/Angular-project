import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TeamsComponent } from './components/teams/teams';
import { ProjectsComponent } from './components/projects/projects';
import { TasksComponent } from './components/tasks/tasks';
import { authGuard } from './guards/auth.guard';

/**
 * הגדרות הניווט (Routes) של האפליקציה
 * 
 * מה זה עושה:
 * 1. מגדיר את כל המסלולים (URLs) באפליקציה
 * 2. קושר כל URL לקומפוננטה מתאימה
 * 3. מגן על routes מסוימים עם authGuard (רק למשתמשים מחוברים)
 */
export const routes: Routes = [
  // נתיב ברירת מחדל - מפנה לעמוד הצוותים
  {
    path: '',
    redirectTo: '/teams',
    pathMatch: 'full'
  },
  
  // עמוד התחברות - פתוח לכולם (ללא Guard)
  {
    path: 'login',
    component: LoginComponent
  },
  
  // עמוד צוותים - מוגן (רק למשתמשים מחוברים)
  {
    path: 'teams',
    component: TeamsComponent,
    canActivate: [authGuard]
  },
  
  // עמוד פרויקטים לפי צוות - מוגן
  {
    path: 'teams/:teamId/projects',
    component: ProjectsComponent,
    canActivate: [authGuard]
  },
  
  // עמוד משימות לפי פרויקט - מוגן
  {
    path: 'projects/:projectId/tasks',
    component: TasksComponent,
    canActivate: [authGuard]
  },
  
  // נתיב 404 - כל URL שלא קיים מפנה לעמוד הצוותים
  {
    path: '**',
    redirectTo: '/teams'
  }
];
