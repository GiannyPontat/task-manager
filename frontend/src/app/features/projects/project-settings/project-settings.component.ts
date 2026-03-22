import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Project, ProjectMember, ProjectRole } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { InvitationService } from '../../../core/services/invitation.service';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTabsModule, MatTableModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <div class="dlg">

      <!-- Header -->
      <header class="dlg-header">
        <div class="header-left">
          <div class="header-icon"><mat-icon>settings</mat-icon></div>
          <div>
            <h2 class="dlg-title">Paramètres</h2>
            <span class="project-name-sub">{{ data.project.name }}</span>
          </div>
        </div>
        <div class="header-right">
          <span class="role-badge" [class.is-admin]="isAdmin">{{ data.project.currentUserRole }}</span>
          <button mat-icon-button class="close-btn" (click)="dialogRef.close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <mat-tab-group animationDuration="180ms" class="settings-tabs">

        <!-- ── Membres ── -->
        <mat-tab label="Membres">
          <div class="tab-body">

            <div class="tab-section-header">
              <span class="section-label">Équipe ({{ members.length }})</span>
              @if (isAdmin && !showInvite) {
                <button mat-button class="btn-invite" (click)="showInvite = true">
                  <mat-icon>person_add</mat-icon>
                  Inviter un membre
                </button>
              }
            </div>

            @if (showInvite) {
              <div class="invite-row">
                <mat-form-field appearance="outline" class="invite-field">
                  <mat-label>Email</mat-label>
                  <mat-icon matPrefix>email</mat-icon>
                  <input matInput type="email" [(ngModel)]="inviteEmail"
                         placeholder="exemple@mail.com"
                         (keyup.enter)="onInviteMember()"
                         (keyup.escape)="showInvite = false; inviteEmail = ''" />
                </mat-form-field>
                <button mat-flat-button class="btn-primary-sm" [disabled]="!inviteEmail" (click)="onInviteMember()">
                  Envoyer
                </button>
                <button mat-icon-button class="btn-cancel-sm" (click)="showInvite = false; inviteEmail = ''">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }

            <table mat-table [dataSource]="members" class="members-table">

              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
                <td mat-cell *matCellDef="let m">
                  <div class="user-cell">
                    <div class="member-avatar">{{ m.username.charAt(0).toUpperCase() }}</div>
                    <div class="user-info">
                      <span class="member-username">{{ m.username }}</span>
                      <span class="member-email">{{ m.email }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let m">
                  @if (isAdmin) {
                    <mat-select class="role-select" [value]="m.role"
                                (selectionChange)="onChangeRole(m.userId, $event.value)">
                      <mat-option value="ADMIN">Admin</mat-option>
                      <mat-option value="EDITOR">Éditeur</mat-option>
                      <mat-option value="VIEWER">Lecteur</mat-option>
                    </mat-select>
                  } @else {
                    <span class="role-chip" [class]="'role-' + m.role.toLowerCase()">{{ roleLabel(m.role) }}</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let m">
                  @if (isAdmin) {
                    <button mat-icon-button class="remove-btn"
                            matTooltip="Retirer du projet"
                            (click)="onRemoveMember(m.userId)">
                      <mat-icon>person_remove</mat-icon>
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>

          </div>
        </mat-tab>

        <!-- ── Général ── -->
        <mat-tab label="Général">
          <div class="tab-body">

            <form [formGroup]="generalForm" (ngSubmit)="onSave()">
              <span class="section-label">Informations</span>

              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Nom du projet</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"
                          placeholder="Décrivez l'objectif du projet…"></textarea>
              </mat-form-field>

              @if (isAdmin) {
                <div class="form-footer">
                  <button mat-flat-button class="btn-primary" type="submit"
                          [disabled]="generalForm.invalid || generalForm.pristine">
                    Enregistrer
                  </button>
                </div>
              }
            </form>

            @if (isAdmin) {
              <div class="divider"></div>

              <div class="danger-zone">
                <span class="section-label danger-label">Zone de danger</span>
                <div class="danger-card">
                  <div class="danger-text">
                    <p class="danger-title">Supprimer le projet</p>
                    <p class="danger-desc">Action irréversible — toutes les tâches seront supprimées.</p>
                  </div>
                  <button mat-flat-button class="btn-danger" (click)="onDelete()">
                    <mat-icon>delete_forever</mat-icon>
                    Supprimer
                  </button>
                </div>
              </div>
            }

          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dlg {
      width: 580px;
      max-width: 95vw;
      background: #0f172a;
      color: #f8fafc;
      font-family: 'Inter', -apple-system, sans-serif;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .dlg-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      background: #1e293b;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-icon {
      width: 34px; height: 34px;
      background: rgba(99,102,241,0.2);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 17px; width: 17px; height: 17px; color: #818cf8; }
    }
    .dlg-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #f8fafc; line-height: 1.2; }
    .project-name-sub { font-size: 0.72rem; color: rgba(255,255,255,0.4); }
    .header-right { display: flex; align-items: center; gap: 10px; }
    .role-badge {
      font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      padding: 2px 8px; border-radius: 4px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.4);
    }
    .role-badge.is-admin { color: #a78bfa; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.3); }
    .close-btn { color: rgba(255,255,255,0.35) !important; &:hover { color: #f8fafc !important; } }

    /* ── Tabs ── */
    ::ng-deep .settings-tabs .mat-mdc-tab-header {
      background: #1e293b;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    ::ng-deep .settings-tabs .mdc-tab__text-label { color: rgba(255,255,255,0.4) !important; font-size: 0.82rem !important; font-weight: 500 !important; }
    ::ng-deep .settings-tabs .mdc-tab--active .mdc-tab__text-label { color: #f8fafc !important; }
    ::ng-deep .settings-tabs .mdc-tab-indicator__content--underline { background-color: #6366f1 !important; }
    ::ng-deep .settings-tabs .mat-mdc-tab-body-wrapper { flex: 1; }

    /* ── Tab body ── */
    .tab-body {
      padding: 24px 24px 28px;
      max-height: 55vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .section-label {
      display: block;
      font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: rgba(255,255,255,0.35);
      margin-bottom: 14px;
    }

    .tab-section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px;
      .section-label { margin-bottom: 0; }
    }

    /* ── Invite row ── */
    .invite-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(99,102,241,0.06);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 12px;
    }
    .invite-field { flex: 1; margin-bottom: -1.25em; }
    .btn-invite {
      color: #818cf8 !important; font-size: 0.78rem !important; font-weight: 600 !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
    }
    .btn-primary-sm {
      height: 36px; padding: 0 16px !important; border-radius: 8px !important;
      background: #6366f1 !important; color: #fff !important;
      font-size: 0.78rem !important; font-weight: 600 !important; white-space: nowrap;
    }
    .btn-cancel-sm { color: rgba(255,255,255,0.3) !important; flex-shrink: 0; }

    /* ── Members table ── */
    .members-table { width: 100%; background: transparent !important; }

    ::ng-deep .members-table th.mat-mdc-header-cell {
      background: transparent !important; color: rgba(255,255,255,0.3) !important;
      font-size: 0.62rem !important; font-weight: 700 !important; text-transform: uppercase !important;
      letter-spacing: 0.08em !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      padding: 8px 12px !important;
    }
    ::ng-deep .members-table td.mat-mdc-cell {
      border-bottom: 1px solid rgba(255,255,255,0.04) !important;
      padding: 10px 12px !important; background: transparent !important;
    }
    ::ng-deep .members-table tr.mat-mdc-row:hover td { background: rgba(255,255,255,0.02) !important; }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .member-avatar {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: #fff;
    }
    .user-info { display: flex; flex-direction: column; }
    .member-username { font-size: 0.82rem; font-weight: 500; color: #f8fafc; }
    .member-email { font-size: 0.72rem; color: rgba(255,255,255,0.4); }

    .role-select {
      width: 110px;
      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.1) !important; }
      ::ng-deep .mat-mdc-select-value { font-size: 0.78rem !important; font-weight: 600 !important; color: #818cf8 !important; }
      ::ng-deep .mat-mdc-select-arrow { color: #818cf8 !important; }
    }

    .role-chip {
      font-size: 0.68rem; font-weight: 600; padding: 2px 8px;
      border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .role-ADMIN   { color: #a78bfa; background: rgba(167,139,250,0.12); }
    .role-EDITOR  { color: #34d399; background: rgba(52,211,153,0.1); }
    .role-VIEWER  { color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.06); }

    .remove-btn { color: rgba(255,255,255,0.25) !important; &:hover { color: #ff4d4d !important; } }

    /* ── General form ── */
    .full-field {
      width: 100%; margin-bottom: 16px;
      ::ng-deep .mdc-text-field { background: rgba(255,255,255,0.04) !important; border-radius: 12px !important; }
      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.1) !important; }
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__leading,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__trailing { border-color: rgba(99,102,241,0.6) !important; }
      ::ng-deep input, ::ng-deep textarea { color: #f8fafc !important; }
      ::ng-deep .mdc-floating-label { color: rgba(255,255,255,0.4) !important; }
    }
    .form-footer { display: flex; justify-content: flex-end; margin-top: 4px; }
    .btn-primary {
      height: 38px; padding: 0 20px !important; border-radius: 10px !important;
      background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
      color: #fff !important; font-weight: 600 !important;
      box-shadow: 0 4px 14px rgba(99,102,241,0.3) !important;
    }

    /* ── Danger zone ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      margin: 28px 0 24px;
    }
    .danger-label { color: rgba(255,77,77,0.6) !important; }
    .danger-card {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 18px 20px;
      background: rgba(255,77,77,0.05);
      border: 1px solid rgba(255,77,77,0.2);
      border-radius: 14px;
    }
    .danger-text p { margin: 0; }
    .danger-title { font-size: 0.85rem; font-weight: 600; color: #ff4d4d; }
    .danger-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 4px !important; }
    .btn-danger {
      height: 36px; padding: 0 16px !important; border-radius: 9px !important;
      background: rgba(255,77,77,0.9) !important; color: #fff !important;
      font-size: 0.78rem !important; font-weight: 600 !important; white-space: nowrap; flex-shrink: 0;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
    }
  `],
})
export class ProjectSettingsComponent implements OnInit {
  readonly dialogRef     = inject(MatDialogRef<ProjectSettingsComponent>);
  readonly data: { project: Project } = inject(MAT_DIALOG_DATA);
  private readonly projectService    = inject(ProjectService);
  private readonly invitationService = inject(InvitationService);
  private readonly snack             = inject(MatSnackBar);
  private readonly fb                = inject(FormBuilder);

  isAdmin = this.data.project.currentUserRole === 'ADMIN';
  members: ProjectMember[] = [...(this.data.project.members ?? [])];
  cols = ['user', 'role', 'actions'];

  showInvite = false;
  inviteEmail = '';

  generalForm = this.fb.group({
    name:        [{ value: this.data.project.name,        disabled: !this.isAdmin }, Validators.required],
    description: [{ value: this.data.project.description ?? '', disabled: !this.isAdmin }],
  });

  ngOnInit() {}

  roleLabel(role: ProjectRole): string {
    return ({ ADMIN: 'Admin', EDITOR: 'Éditeur', VIEWER: 'Lecteur' } as Record<string, string>)[role] ?? role;
  }

  onSave(): void {
    if (this.generalForm.invalid) return;
    const { name, description } = this.generalForm.getRawValue();
    this.projectService.updateProject(this.data.project.id, { name: name!, description: description ?? undefined }).subscribe({
      next: () => {
        this.snack.open('Projet mis à jour', 'OK', { duration: 3000 });
        this.generalForm.markAsPristine();
      },
      error: () => this.snack.open('Erreur lors de la mise à jour', 'OK', { duration: 3000 }),
    });
  }

  onInviteMember(): void {
    const email = this.inviteEmail.trim();
    if (!email) return;
    this.projectService.addMember(this.data.project.id, { email, role: 'EDITOR' }).subscribe({
      next: (m: ProjectMember) => {
        this.members = [...this.members, m];
        this.snack.open(`${email} ajouté au projet`, 'OK', { duration: 3000 });
        this.showInvite = false; this.inviteEmail = '';
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.invitationService.invite(email, undefined, this.data.project.id).subscribe({
            next: (r) => {
              this.snack.open(r.message, 'OK', { duration: 4000 });
              this.showInvite = false; this.inviteEmail = '';
            },
            error: () => this.snack.open('Erreur lors de l\'invitation', 'OK', { duration: 3000 }),
          });
        } else {
          this.snack.open(err.error?.message ?? 'Erreur', 'OK', { duration: 3000 });
        }
      },
    });
  }

  onChangeRole(userId: number, role: ProjectRole): void {
    this.projectService.changeMemberRole(this.data.project.id, userId, role).subscribe({
      next: () => this.snack.open('Rôle mis à jour', 'OK', { duration: 2000 }),
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 }),
    });
  }

  onRemoveMember(userId: number): void {
    if (!confirm('Retirer ce membre du projet ?')) return;
    this.projectService.removeMember(this.data.project.id, userId).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.userId !== userId);
        this.snack.open('Membre retiré', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 }),
    });
  }

  onDelete(): void {
    if (!confirm(`Supprimer le projet "${this.data.project.name}" définitivement ?`)) return;
    this.projectService.deleteProject(this.data.project.id).subscribe({
      next: () => { this.dialogRef.close('DELETED'); this.snack.open('Projet supprimé', 'OK', { duration: 3000 }); },
      error: () => this.snack.open('Erreur lors de la suppression', 'OK', { duration: 3000 }),
    });
  }
}
