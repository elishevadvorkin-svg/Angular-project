import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TeamsService } from '../../services/teams.service';
import { AuthService } from '../../services/auth.service';
import { UsersService, User } from '../../services/users.service';
import { Team } from '../../models';

/**
 * TeamsComponent - מסך ניהול צוותים
 * 
 * מה המסך מכיל:
 * 1. רשימת הצוותים של המשתמש
 * 2. טופס ליצירת צוות חדש
 * 3. אפשרות להוסיף חברים לצוות
 * 4. אפשרות למחוק צוות
 * 5. אפשרות לנווט לפרויקטים של הצוות
 */
@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
})
export class TeamsComponent implements OnInit {
  // Dependency Injection עם inject()
  private teamsService = inject(TeamsService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private router = inject(Router);

  // Signals לניהול state
  teams = signal<Team[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showCreateForm = signal<boolean>(false);
  selectedTeam = signal<Team | null>(null);
  showAddMemberModal = signal<boolean>(false);
  
  // רשימות למודל הוספת חברים
  allUsers = signal<User[]>([]);
  teamMembers = signal<User[]>([]);
  selectedUserId: number = 0;
  
  // אובייקט לטופס יצירת צוות
  newTeamName = '';

  /**
   * מתבצע כשהקומפוננטה נטענת
   * טוען את רשימת הצוותים מהשרת
   */
  ngOnInit(): void {
    this.loadTeams();
  }

  /**
   * טעינת רשימת הצוותים
   */
  loadTeams(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.teamsService.getTeams().subscribe({
      next: (teams) => {
        // טעינת מידע על בעלי הצוותים מ-localStorage
        const savedOwners = localStorage.getItem('teamOwners');
        if (savedOwners) {
          try {
            const ownersData: { [teamId: number]: number } = JSON.parse(savedOwners);
            teams = teams.map(team => ({
              ...team,
              ownerId: ownersData[team.id]
            }));
          } catch (error) {
            console.error('Error loading team owners:', error);
          }
        }
        
        this.teams.set(teams);
        this.loading.set(false);
        console.log('Teams loaded:', teams);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.errorMessage.set('שגיאה בטעינת הצוותים');
        this.loading.set(false);
      }
    });
  }

  /**
   * יצירת צוות חדש
   */
  onCreateTeam(): void {
    if (!this.newTeamName || this.newTeamName.length < 2) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.teamsService.createTeam({ name: this.newTeamName }).subscribe({
      next: (newTeam) => {
        console.log('Team created:', newTeam);
        
        // שמירת המשתמש הנוכחי כבעל הצוות
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          newTeam.ownerId = currentUser.id;
          
          // שמירה ב-localStorage
          const savedOwners = localStorage.getItem('teamOwners');
          let ownersData: { [teamId: number]: number } = {};
          
          if (savedOwners) {
            try {
              ownersData = JSON.parse(savedOwners);
            } catch (error) {
              console.error('Error parsing team owners:', error);
            }
          }
          
          ownersData[newTeam.id] = currentUser.id;
          localStorage.setItem('teamOwners', JSON.stringify(ownersData));
        }
        
        this.teams.set([...this.teams(), newTeam]); // הוספת הצוות החדש לרשימה
        this.newTeamName = ''; // ניקוי השדה
        this.showCreateForm.set(false); // סגירת הטופס
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error creating team:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה ביצירת הצוות');
        this.loading.set(false);
      }
    });
  }

  /**
   * מחיקת צוות
   */
  onDeleteTeam(teamId: number): void {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הצוות?')) {
      return;
    }

    this.teamsService.deleteTeam(teamId).subscribe({
      next: () => {
        console.log('Team deleted:', teamId);
        // הסרת הצוות מהרשימה
        this.teams.set(this.teams().filter(team => team.id !== teamId));
      },
      error: (error) => {
        console.error('Error deleting team:', error);
        this.errorMessage.set(error.error?.error || 'שגיאה במחיקת הצוות');
      }
    });
  }

  /**
   * פתיחת מודל הוספת חברים
   */
  openAddMemberModal(team: Team): void {
    console.log('Opening modal for team:', team);
    console.log('Team ownerId:', team.ownerId);
    
    // אם אין ownerId, נניח שהמשתמש המחובר הוא ה-owner
    if (!team.ownerId) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        team.ownerId = currentUser.id;
        // שמירה ב-localStorage לפעם הבאה
        const savedOwners = localStorage.getItem('teamOwners');
        let ownersData: { [teamId: number]: number } = {};
        
        if (savedOwners) {
          try {
            ownersData = JSON.parse(savedOwners);
          } catch (error) {
            console.error('Error parsing team owners:', error);
          }
        }
        
        ownersData[team.id] = currentUser.id;
        localStorage.setItem('teamOwners', JSON.stringify(ownersData));
        console.log('Set current user as owner for existing team');
      }
    }
    
    this.selectedTeam.set(team);
    this.showAddMemberModal.set(true);
    this.loadAllUsers();
    this.loadTeamMembers(team.id);
  }

  /**
   * טעינת כל המשתמשים
   */
  loadAllUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.allUsers.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
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
      },
      error: (error) => {
        console.error('Error loading team members:', error);
      }
    });
  }

  /**
   * הוספת חבר לצוות
   */
  addMember(): void {
    if (!this.selectedUserId || !this.selectedTeam()) return;

    this.teamsService.addMember(this.selectedTeam()!.id, this.selectedUserId).subscribe({
      next: () => {
        console.log('Member added successfully');
        this.loadTeamMembers(this.selectedTeam()!.id);
        this.selectedUserId = 0;
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.errorMessage.set('שגיאה בהוספת חבר');
      }
    });
  }

  /**
   * הסרת חבר מהצוות
   */
  removeMemberFromTeam(userId: number): void {
    if (!this.selectedTeam()) return;

    if (confirm('האם אתה בטוח שברצונך להסיר חבר זה?')) {
      this.teamsService.removeMember(this.selectedTeam()!.id, userId).subscribe({
        next: () => {
          console.log('Member removed successfully');
          this.loadTeamMembers(this.selectedTeam()!.id);
        },
        error: (error) => {
          console.error('Error removing member:', error);
          // הצגת הודעה מתאימה אם זה ראש הצוות
          if (error.status === 403 && error.error?.error?.includes('owner')) {
            alert('לא ניתן להסיר את ראש הצוות');
          } else {
            this.errorMessage.set('שגיאה בהסרת חבר');
          }
        }
      });
    }
  }

  /**
   * סגירת מודל חברים
   */
  closeAddMemberModal(): void {
    this.showAddMemberModal.set(false);
    this.selectedTeam.set(null);
    this.selectedUserId = 0;
  }

  /**
   * בדיקה אם משתמש כבר חבר בצוות
   */
  isUserInTeam(userId: number): boolean {
    return this.teamMembers().some(member => member.id === userId);
  }

  /**
   * בדיקה אם משתמש הוא ראש הצוות
   */
  isTeamOwner(userId: number): boolean {
    if (!this.selectedTeam()) return false;
    const isOwner = this.selectedTeam()!.ownerId === userId;
    console.log(`Checking if user ${userId} is owner. Team ownerId: ${this.selectedTeam()!.ownerId}, Result: ${isOwner}`);
    return isOwner;
  }

  /**
   * מעבר לעמוד הפרויקטים של הצוות
   */
  viewProjects(teamId: number): void {
    this.router.navigate(['/teams', teamId, 'projects']);
  }

  /**
   * התנתקות
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * החלפת מצב הצגת טופס יצירת הצוות
   */
  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    if (!this.showCreateForm()) {
      this.newTeamName = '';
      this.errorMessage.set('');
    }
  }
}
