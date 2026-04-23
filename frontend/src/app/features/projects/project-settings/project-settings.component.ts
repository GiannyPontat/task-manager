import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
    CommonModule, DatePipe, FormsModule, ReactiveFormsModule,
    MatTabsModule, MatTableModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <div class="dlg">

      <!-- ── Header ── -->
      <header class="dlg-header">
        <div class="header-left">
          <div class="project-avatar">{{ data.project.name.charAt(0).toUpperCase() }}</div>
          <div class="header-meta">
            <div class="header-top-row">
              <h2 class="dlg-title">{{ data.project.name }}</h2>
              <span class="role-badge" [class.is-admin]="isAdmin">{{ data.project.currentUserRole }}</span>
            </div>
            <div class="header-progress-row">
              <div class="mini-progress-track">
                <div class="mini-progress-fill" [style.width.%]="progressPercent"></div>
              </div>
              <span class="progress-label">{{ progressPercent }}% complété</span>
            </div>
          </div>
        </div>
        <button mat-icon-button class="close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- ── Tabs ── -->
      <mat-tab-group animationDuration="200ms" class="settings-tabs">

        <!-- ── Aperçu ── -->
        <mat-tab label="Aperçu">
          <div class="tab-body">

            <span class="section-label">Progression des tâches</span>

            <div class="progress-block">
              <div class="progress-numbers">
                <span class="progress-count">{{ taskStats.done }}<span class="progress-total">/{{ taskStats.total }}</span></span>
                <span class="progress-pct">{{ progressPercent }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="progressPercent"></div>
              </div>
              <div class="progress-legend">
                <span class="legend-dot done"></span><span>{{ taskStats.done }} terminées</span>
                <span class="legend-dot in-progress"></span><span>{{ taskStats.inProgress }} en cours</span>
                <span class="legend-dot todo"></span><span>{{ taskStats.todo }} à faire</span>
              </div>
            </div>

            <span class="section-label" style="margin-top:24px">Statistiques</span>

            <div class="stat-grid">
              <div class="stat-card stat-todo">
                <div class="stat-icon-wrap todo-icon">
                  <mat-icon>pending_actions</mat-icon>
                </div>
                <div class="stat-value">{{ taskStats.todo }}</div>
                <div class="stat-label">À faire</div>
              </div>
              <div class="stat-card stat-in-progress">
                <div class="stat-icon-wrap inprogress-icon">
                  <mat-icon>autorenew</mat-icon>
                </div>
                <div class="stat-value">{{ taskStats.inProgress }}</div>
                <div class="stat-label">En cours</div>
              </div>
              <div class="stat-card stat-done">
                <div class="stat-icon-wrap done-icon">
                  <mat-icon>task_alt</mat-icon>
                </div>
                <div class="stat-value">{{ taskStats.done }}</div>
                <div class="stat-label">Terminées</div>
              </div>
            </div>

            <div class="divider"></div>

            <span class="section-label">Détails du projet</span>
            <div class="meta-list">
              <div class="meta-row">
                <mat-icon class="meta-icon">person_outline</mat-icon>
                <span class="meta-key">Propriétaire</span>
                <span class="meta-val">{{ data.project.ownerName }}</span>
              </div>
              <div class="meta-row">
                <mat-icon class="meta-icon">group_outline</mat-icon>
                <span class="meta-key">Membres</span>
                <span class="meta-val">{{ data.project.memberCount }}</span>
              </div>
              <div class="meta-row">
                <mat-icon class="meta-icon">calendar_today</mat-icon>
                <span class="meta-key">Créé le</span>
                <span class="meta-val">{{ data.project.createdAt | date:'dd MMM yyyy' }}</span>
              </div>
            </div>

          </div>
        </mat-tab>

        <!-- ── Membres ── -->
        <mat-tab label="Membres">
          <div class="tab-body">

            <div class="tab-section-header">
              <span class="section-label">Équipe ({{ members.length }})</span>
              @if (isAdmin && !showInvite) {
                <button mat-button class="btn-invite" (click)="showInvite = true">
                  <mat-icon>person_add</mat-icon>
                  Inviter
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
                                [disabled]="isLastAdmin(m)"
                                [matTooltip]="isLastAdmin(m) ? 'Dernier admin — impossible de changer' : ''"
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
                <textarea matInput formControlName="description" rows="3"></textarea>
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
      width: 620px;
      max-width: 95vw;
      background: var(--bg-card);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, sans-serif;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      --mdc-outlined-text-field-input-text-color: var(--text-main);
      --mdc-outlined-text-field-label-text-color: var(--text-muted);
      --mdc-outlined-text-field-outline-color: var(--border);
      --mdc-outlined-text-field-hover-outline-color: var(--border);
      --mdc-outlined-text-field-focus-outline-color: var(--primary);
      --mdc-outlined-text-field-focus-label-text-color: var(--primary);
      --mat-select-enabled-trigger-text-color: var(--text-main);
      --mat-select-trigger-text-color: var(--text-main);
      --mat-option-label-text-color: var(--text-main);
      --mdc-outlined-text-field-input-text-placeholder-color: var(--text-muted);
    }

    ::ng-deep .full-field input::placeholder,
    ::ng-deep .full-field textarea::placeholder { color: var(--text-muted) !important; opacity: 1; }
    ::ng-deep .role-select .mat-mdc-select-value-text { color: var(--text-main) !important; }

    /* ── Header ── */
    .dlg-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      background: var(--bg-app);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      gap: 12px;
    }
    .header-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }

    .project-avatar {
      width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
      background: linear-gradient(135deg, #ff7335 0%, #ffb088 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; font-weight: 800; color: #fff;
      box-shadow: 0 4px 12px rgba(255,115,53,0.4);
    }

    .header-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }

    .header-top-row { display: flex; align-items: center; gap: 10px; }

    .dlg-title {
      margin: 0;
      font-size: 1rem; font-weight: 700; color: var(--text-main);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .role-badge {
      font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      padding: 2px 7px; border-radius: 4px; flex-shrink: 0;
      background: var(--bg-panel); border: 1px solid var(--border-panel);
      color: var(--text-muted);
    }
    .role-badge.is-admin { color: #ffb088; background: rgba(255,115,53,0.12); border-color: rgba(255,115,53,0.3); }

    .header-progress-row { display: flex; align-items: center; gap: 8px; }

    .mini-progress-track {
      flex: 1; height: 4px; border-radius: 99px;
      background: var(--border);
      overflow: hidden;
    }
    .mini-progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, #ff7335 0%, #ffb088 100%);
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      animation: fillIn 1s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes fillIn {
      from { width: 0% !important; }
    }
    .progress-label { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }

    .close-btn { color: var(--text-muted) !important; flex-shrink: 0; }
    .close-btn:hover { color: var(--text-main) !important; }

    /* ── Tabs ── */
    ::ng-deep .settings-tabs .mat-mdc-tab-header {
      background: var(--bg-app);
      border-bottom: 1px solid var(--border);
    }
    ::ng-deep .settings-tabs .mdc-tab__text-label { color: var(--text-muted) !important; font-size: 0.82rem !important; font-weight: 500 !important; }
    ::ng-deep .settings-tabs .mdc-tab--active .mdc-tab__text-label { color: var(--text-main) !important; }
    ::ng-deep .settings-tabs .mdc-tab-indicator__content--underline { background-color: var(--primary) !important; }
    ::ng-deep .settings-tabs .mat-mdc-tab-body-wrapper { flex: 1; }
    ::ng-deep .settings-tabs .mat-mdc-tab-body,
    ::ng-deep .settings-tabs .mat-mdc-tab-body-content { background: transparent !important; }

    /* ── Tab body ── */
    .tab-body {
      padding: 22px 22px 26px;
      max-height: 58vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }

    .section-label {
      display: block;
      font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--text-muted);
      margin-bottom: 12px;
    }

    /* ── Progress block ── */
    .progress-block {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 6px;
    }
    .progress-numbers {
      display: flex; align-items: baseline; justify-content: space-between;
      margin-bottom: 10px;
    }
    .progress-count {
      font-size: 1.6rem; font-weight: 800; color: var(--text-main); line-height: 1;
    }
    .progress-total { font-size: 1rem; font-weight: 500; color: var(--text-muted); }
    .progress-pct { font-size: 0.9rem; font-weight: 700; color: var(--primary); }
    .progress-track {
      height: 8px; border-radius: 99px;
      background: var(--border);
      overflow: hidden; margin-bottom: 12px;
    }
    .progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, #ff7335 0%, #ffb088 100%);
      animation: fillIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .progress-legend {
      display: flex; align-items: center; gap: 14px;
      font-size: 0.72rem; color: var(--text-muted);
    }
    .legend-dot {
      display: inline-block; width: 7px; height: 7px; border-radius: 50%;
    }
    .legend-dot.done { background: #ffb088; box-shadow: 0 0 6px rgba(255,176,136,0.6); }
    .legend-dot.in-progress { background: #0ea5e9; box-shadow: 0 0 6px rgba(14,165,233,0.6); }
    .legend-dot.todo { background: var(--border); }

    /* ── Stat grid ── */
    .stat-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      margin-bottom: 6px;
    }
    .stat-card {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px 14px;
      display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
      transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s;
      cursor: default;
    }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .stat-icon-wrap {
      width: 32px; height: 32px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
    }
    .todo-icon { background: rgba(255,189,46,0.12); mat-icon { color: #ffbd2e; } }
    .inprogress-icon { background: rgba(14,165,233,0.12); mat-icon { color: #0ea5e9; animation: spin 2.4s linear infinite; } }
    .done-icon { background: rgba(46,204,113,0.12); mat-icon { color: #2ecc71; } }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-main); line-height: 1; }
    .stat-label { font-size: 0.68rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

    /* ── Meta list ── */
    .meta-list { display: flex; flex-direction: column; gap: 2px; }
    .meta-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 10px;
      transition: background 0.15s;
    }
    .meta-row:hover { background: var(--bg-panel); }
    .meta-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; color: var(--text-muted); flex-shrink: 0; }
    .meta-key { font-size: 0.78rem; color: var(--text-muted); flex: 1; }
    .meta-val { font-size: 0.78rem; font-weight: 600; color: var(--text-main); }

    /* ── Tab section header ── */
    .tab-section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px;
      .section-label { margin-bottom: 0; }
    }

    /* ── Invite row ── */
    .invite-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px; padding: 12px;
      background: rgba(255,115,53,0.06);
      border: 1px solid rgba(255,115,53,0.2);
      border-radius: 12px;
    }
    .invite-field { flex: 1; margin-bottom: -1.25em; }
    .btn-invite {
      color: var(--primary) !important; font-size: 0.78rem !important; font-weight: 600 !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
    }
    .btn-primary-sm {
      height: 36px; padding: 0 16px !important; border-radius: 8px !important;
      background: var(--primary) !important; color: #fff !important;
      font-size: 0.78rem !important; font-weight: 600 !important; white-space: nowrap;
    }
    .btn-cancel-sm { color: var(--text-muted) !important; flex-shrink: 0; }

    /* ── Members table ── */
    .members-table { width: 100%; background: transparent !important; }
    ::ng-deep .members-table th.mat-mdc-header-cell {
      background: transparent !important; color: var(--text-muted) !important;
      font-size: 0.62rem !important; font-weight: 700 !important; text-transform: uppercase !important;
      letter-spacing: 0.08em !important; border-bottom: 1px solid var(--border) !important;
      padding: 8px 12px !important;
    }
    ::ng-deep .members-table td.mat-mdc-cell {
      border-bottom: 1px solid var(--border) !important;
      padding: 10px 12px !important; background: transparent !important;
    }
    ::ng-deep .members-table tr.mat-mdc-row:hover td { background: var(--bg-panel) !important; }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .member-avatar {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #ff7335 0%, #ffb088 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: #fff;
    }
    .user-info { display: flex; flex-direction: column; }
    .member-username { font-size: 0.82rem; font-weight: 500; color: var(--text-main); }
    .member-email { font-size: 0.72rem; color: var(--text-muted); }

    .role-select {
      width: 110px;
      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing { border-color: var(--border) !important; }
      ::ng-deep .mat-mdc-select-value { font-size: 0.78rem !important; font-weight: 600 !important; color: var(--text-main) !important; }
      ::ng-deep .mat-mdc-select-arrow { color: var(--text-muted) !important; }
    }

    .role-chip {
      font-size: 0.68rem; font-weight: 600; padding: 2px 8px;
      border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .role-ADMIN   { color: #ffb088; background: rgba(255,115,53,0.12); }
    .role-EDITOR  { color: #059669; background: rgba(5,150,105,0.1); }
    .role-VIEWER  { color: var(--text-muted); background: var(--bg-panel); }
    .remove-btn { color: var(--text-muted) !important; &:hover { color: #ff4d4d !important; } }

    /* ── General form ── */
    .full-field {
      width: 100%; margin-bottom: 16px;
      ::ng-deep .mdc-text-field { background: var(--input-bg) !important; border-radius: 12px !important; }
      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing { border-color: var(--border) !important; }
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__leading,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__trailing { border-color: var(--primary) !important; }
      ::ng-deep input, ::ng-deep textarea { color: var(--text-main) !important; }
      ::ng-deep .mdc-floating-label { color: var(--text-muted) !important; }
    }
    .form-footer { display: flex; justify-content: flex-end; margin-top: 4px; }
    .btn-primary {
      height: 38px; padding: 0 20px !important; border-radius: 10px !important;
      background: linear-gradient(135deg, #ff7335 0%, #ffb088 100%) !important;
      color: #fff !important; font-weight: 600 !important;
      box-shadow: 0 4px 14px rgba(255,115,53,0.3) !important;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
      margin: 24px 0 20px;
    }

    /* ── Danger zone ── */
    .danger-label { color: rgba(255,77,77,0.6) !important; }
    .danger-card {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 16px 18px;
      background: rgba(255,77,77,0.05);
      border: 1px solid rgba(255,77,77,0.2);
      border-radius: 14px;
    }
    .danger-text p { margin: 0; }
    .danger-title { font-size: 0.85rem; font-weight: 600; color: #ff4d4d; }
    .danger-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px !important; }
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

  taskStats = { todo: 4, inProgress: 3, done: 8, total: 15 };
  get progressPercent(): number { return Math.round((this.taskStats.done / this.taskStats.total) * 100); }

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

  isLastAdmin(member: ProjectMember): boolean {
    return member.role === 'ADMIN' && this.members.filter(m => m.role === 'ADMIN').length <= 1;
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
