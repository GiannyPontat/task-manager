import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatRippleModule,
  ],
  template: `
    <div class="profile-page">
      <div class="profile-container">

        <!-- ══════════════════ AVATAR HEADER ══════════════════ -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <div class="avatar-circle">
              @if (avatarUrl()) {
                <img class="avatar-img" [src]="avatarUrl()!" alt="avatar" />
              } @else {
                <span class="avatar-initials">{{ initials() }}</span>
              }
            </div>
            <input #fileInput type="file" accept="image/*" style="display:none"
                   (change)="onFileSelected($event)" />
            <button class="change-photo-btn" matRipple (click)="fileInput.click()">
              <mat-icon>photo_camera</mat-icon>
              Changer la photo
            </button>
            @if (avatarUrl()) {
              <button class="remove-photo-btn" matRipple (click)="removeAvatar()">
                <mat-icon>person</mat-icon>
                Utiliser les initiales
              </button>
            }
          </div>
          <div class="user-identity">
            <h1 class="user-name">{{ username() }}</h1>
            <span class="user-role-badge">
              <mat-icon>verified</mat-icon>
              {{ roleLabel() }}
            </span>
          </div>
        </div>

        <!-- ══════════════════ STATS ══════════════════ -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ doneTasks() }}</span>
            <span class="stat-label">Tâches finies</span>
            <div class="stat-bar">
              <div class="stat-bar-fill done" [style.width.%]="donePercent()"></div>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ pendingTasks() }}</span>
            <span class="stat-label">En attente</span>
            <div class="stat-bar">
              <div class="stat-bar-fill pending" [style.width.%]="pendingPercent()"></div>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ productivity() }}%</span>
            <span class="stat-label">Productivité</span>
            <div class="stat-bar">
              <div class="stat-bar-fill productivity" [style.width.%]="productivity()"></div>
            </div>
          </div>
        </div>

        <!-- ══════════════════ INFOS CARD ══════════════════ -->
        <div class="glass-card">
          <div class="card-header">
            <div class="card-icon"><mat-icon>person</mat-icon></div>
            <div>
              <h2 class="card-title">Informations personnelles</h2>
              <p class="card-subtitle">Modifiez votre nom et votre adresse e-mail</p>
            </div>
          </div>

          <form [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="card-form">
            <div class="fields-row">
              <mat-form-field appearance="outline" class="field">
                <mat-label>Nom / Pseudo</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="username" placeholder="Votre nom affiché" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="field field-readonly">
                <mat-label>Adresse e-mail</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput [value]="auth.currentUser()?.email ?? ''" readonly />
                <mat-hint>L'e-mail ne peut pas être modifié ici</mat-hint>
              </mat-form-field>
            </div>
            <div class="form-footer">
              <button type="submit" class="save-btn" matRipple [disabled]="infoForm.invalid || savingInfo()">
                <mat-icon [class.spin]="savingInfo()">{{ savingInfo() ? 'sync' : 'save' }}</mat-icon>
                Enregistrer les infos
              </button>
            </div>
          </form>
        </div>

        <!-- ══════════════════ SECURITY CARD ══════════════════ -->
        <div class="glass-card">
          <div class="card-header">
            <div class="card-icon security"><mat-icon>lock</mat-icon></div>
            <div>
              <h2 class="card-title">Sécurité</h2>
              <p class="card-subtitle">Changez votre mot de passe</p>
            </div>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="card-form">
            <div class="fields-row">
              <mat-form-field appearance="outline" class="field">
                <mat-label>Ancien mot de passe</mat-label>
                <mat-icon matPrefix>lock_open</mat-icon>
                <input matInput formControlName="oldPassword"
                       [type]="showOld() ? 'text' : 'password'" />
                <button type="button" mat-icon-button matSuffix (click)="showOld.set(!showOld())">
                  <mat-icon>{{ showOld() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
              <mat-form-field appearance="outline" class="field">
                <mat-label>Nouveau mot de passe</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput formControlName="newPassword"
                       [type]="showNew() ? 'text' : 'password'" />
                <button type="button" mat-icon-button matSuffix (click)="showNew.set(!showNew())">
                  <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
                  <mat-error>Minimum 8 caractères</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-footer">
              <button type="submit" class="save-btn" matRipple [disabled]="passwordForm.invalid || savingPwd()">
                <mat-icon [class.spin]="savingPwd()">{{ savingPwd() ? 'sync' : 'save' }}</mat-icon>
                Enregistrer le mot de passe
              </button>
            </div>
          </form>
        </div>

        <!-- ══════════════════ DANGER ZONE ══════════════════ -->
        <div class="danger-zone">
          <div class="danger-text">
            <mat-icon>warning_amber</mat-icon>
            <span>La suppression de votre compte est irréversible.</span>
          </div>
          <button class="delete-btn" matRipple (click)="deleteAccount()">
            <mat-icon>delete_forever</mat-icon>
            Supprimer le compte
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
    }

    .profile-page {
      min-height: 100vh;
      background: transparent;
      padding: 40px 24px 60px;
      box-sizing: border-box;
    }

    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Avatar Header ── */
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 0 4px 8px;
    }

    .avatar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #0ea5e9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.2), 0 8px 24px rgba(0,0,0,0.35);
      overflow: hidden;
    }

    .avatar-img {
      display: block;
      width: 96px;
      height: 96px;
      object-fit: cover;
    }

    .avatar-initials {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -1px;
      text-transform: uppercase;
    }

    .change-photo-btn, .remove-photo-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--bg-panel);
      border: 1px solid var(--border-panel);
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-family: inherit;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &:hover { background: var(--bg-panel-hover); color: var(--text-secondary); }
    }

    .user-identity {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-name {
      margin: 0;
      font-size: 1.9rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.6px;
    }

    .user-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 20px;
      color: var(--primary);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 4px 12px;
      width: fit-content;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    /* ── Stats ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-value {
      font-size: 1.7rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.5px;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stat-bar {
      height: 3px;
      background: var(--border);
      border-radius: 2px;
      margin-top: 6px;
      overflow: hidden;
    }

    .stat-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stat-bar-fill.done        { background: linear-gradient(90deg, #10b981, #34d399); }
    .stat-bar-fill.pending     { background: linear-gradient(90deg, #f59e0b, #fcd34d); }
    .stat-bar-fill.productivity { background: linear-gradient(90deg, #6366f1, #3b82f6); }

    /* ── Glass Cards ── */
    .glass-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 24px;
    }

    .card-icon {
      width: 40px; height: 40px; flex-shrink: 0;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #fff; }
    }

    .card-icon.security {
      background: linear-gradient(135deg, #0ea5e9, #22d3ee);
      box-shadow: 0 4px 12px rgba(14,165,233,0.3);
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 3px;
    }

    .card-subtitle {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* ── Form ── */
    .card-form { display: flex; flex-direction: column; }

    .fields-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field { width: 100%; }

    /* Theme-aware Material form fields */
    :host ::ng-deep .field .mat-mdc-text-field-wrapper {
      background: var(--input-bg) !important;
    }
    :host ::ng-deep .field .mdc-notched-outline__leading,
    :host ::ng-deep .field .mdc-notched-outline__notch,
    :host ::ng-deep .field .mdc-notched-outline__trailing {
      border-color: var(--border) !important;
    }
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__trailing {
      border-color: rgba(99,102,241,0.7) !important;
    }
    :host ::ng-deep .field .mdc-floating-label,
    :host ::ng-deep .field .mat-mdc-form-field-label { color: var(--text-muted) !important; }
    :host ::ng-deep .field input { color: var(--text-main) !important; caret-color: #6366f1; }
    :host ::ng-deep .field .mat-mdc-form-field-icon-prefix mat-icon { color: var(--text-muted); }
    :host ::ng-deep .field button mat-icon { color: var(--text-muted); }
    :host ::ng-deep .field .mat-mdc-form-field-hint { color: var(--text-muted) !important; }

    /* Champ en lecture seule */
    :host ::ng-deep .field-readonly input { color: var(--text-muted) !important; cursor: default; }
    :host ::ng-deep .field-readonly .mat-mdc-text-field-wrapper {
      background: var(--bg-panel) !important;
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .save-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 22px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
      transition: opacity 0.2s, transform 0.15s;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .spin {
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ── Danger Zone ── */
    .danger-zone {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: rgba(239,68,68,0.05);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 14px;
      padding: 18px 22px;
    }

    .danger-text {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.82rem;
      color: var(--text-muted);
      mat-icon { color: #ef4444; font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    }

    .delete-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 36px;
      padding: 0 16px;
      border: 1px solid rgba(239,68,68,0.35);
      border-radius: 9px;
      background: rgba(239,68,68,0.08);
      color: #f87171;
      font-size: 0.82rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.2s, border-color 0.2s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover {
        background: rgba(239,68,68,0.15);
        border-color: rgba(239,68,68,0.5);
      }
    }

    @media (max-width: 640px) {
      .profile-page { padding: 24px 16px 48px; }
      .avatar-section { flex-direction: column; align-items: flex-start; gap: 16px; }
      .stats-row { grid-template-columns: 1fr; }
      .fields-row { grid-template-columns: 1fr; }
      .glass-card { padding: 20px 16px; }
      .danger-zone { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  readonly auth      = inject(AuthService);
  private readonly userSvc = inject(UserService);
  private readonly taskSvc        = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly snack   = inject(MatSnackBar);
  private readonly fb      = inject(FormBuilder);

  savingInfo = signal(false);
  savingPwd  = signal(false);
  showOld    = signal(false);
  showNew    = signal(false);

  avatarUrl = computed(() => this.auth.currentUser()?.avatarUrl ?? null);

  doneTasks    = signal(0);
  pendingTasks = signal(0);
  totalTasks   = signal(0);

  donePercent    = computed(() => this.totalTasks() ? Math.round(this.doneTasks() / this.totalTasks() * 100) : 0);
  pendingPercent = computed(() => this.totalTasks() ? Math.round(this.pendingTasks() / this.totalTasks() * 100) : 0);
  productivity   = computed(() => this.donePercent());

  username  = computed(() => this.auth.currentUser()?.username ?? 'Utilisateur');
  roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role ?? '';
    return role === 'ADMIN' ? 'Administrateur' : 'Membre';
  });
  initials = computed(() => {
    const parts = this.username().trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.username().slice(0, 2).toUpperCase();
  });

  infoForm = this.fb.group({
    username: [this.auth.currentUser()?.username ?? '', Validators.required],
  });

  passwordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    const projectId = this.projectService.selected()?.id;
    if (!projectId) return;
    this.taskSvc.getTasks(projectId).subscribe({
      next: (page) => {
        const tasks = page.content ?? [];
        this.totalTasks.set(tasks.length);
        this.doneTasks.set(tasks.filter(t => t.status === 'DONE').length);
        this.pendingTasks.set(tasks.filter(t => t.status === 'TODO').length);
      },
    });
  }

  removeAvatar(): void {
    this.userSvc.updateAvatar(null).subscribe({
      error: () => this.snack.open('Erreur lors de la suppression de la photo', 'OK', { duration: 3000 }),
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.userSvc.updateAvatar(dataUrl).subscribe({
        error: () => this.snack.open('Erreur lors de la mise à jour de la photo', 'OK', { duration: 3000 }),
      });
    };
    reader.readAsDataURL(file);
  }

  saveInfo(): void {
    if (this.infoForm.invalid) return;
    const username = this.infoForm.value.username!.trim();
    this.savingInfo.set(true);
    this.userSvc.updateProfile(username).subscribe({
      next: () => {
        this.savingInfo.set(false);
        this.snack.open(`Nom mis à jour : ${username}`, 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.savingInfo.set(false);
        const msg = err?.error?.message ?? 'Erreur lors de la mise à jour';
        this.snack.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { oldPassword, newPassword } = this.passwordForm.value;
    this.savingPwd.set(true);
    this.userSvc.changePassword(oldPassword!, newPassword!).subscribe({
      next: () => {
        this.savingPwd.set(false);
        this.snack.open('Mot de passe modifié. Reconnectez-vous.', 'OK', { duration: 3000 });
        setTimeout(() => this.auth.logout(), 2000);
      },
      error: (err) => {
        this.savingPwd.set(false);
        const msg = err?.error?.message ?? 'Ancien mot de passe incorrect';
        this.snack.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  deleteAccount(): void {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
    // TODO: DELETE /api/users/me
    this.snack.open('Compte supprimé', 'OK', { duration: 3000 });
    this.auth.logout();
  }
}
