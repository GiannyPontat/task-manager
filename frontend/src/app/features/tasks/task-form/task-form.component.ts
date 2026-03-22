import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Activity, Task, TaskRequest, TaskStatus, Priority } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { InvitationService } from '../../../core/services/invitation.service';

export interface TaskDialogData { task?: Task; projectId?: number; }

interface ChecklistItem { label: string; done: boolean; }
interface Member { name: string; initials: string; color: string; }

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatTooltipModule,
  ],
  template: `
    <div class="dlg-root" [formGroup]="form">

      <!-- ── Header ── -->
      <div class="dlg-header">
        <div class="header-icon">
          <mat-icon>{{ isEdit ? 'edit' : 'add_task' }}</mat-icon>
        </div>
        <input class="title-input" formControlName="title" placeholder="Titre de la tâche…" />
        <button mat-icon-button class="close-btn" (click)="cancel()" matTooltip="Fermer">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
        <p class="title-error">Le titre est requis.</p>
      } @else if (form.get('title')?.hasError('maxlength') && form.get('title')?.touched) {
        <p class="title-error">Maximum 100 caractères.</p>
      }

      <!-- ── Body ── -->
      <div class="dlg-body">

        <!-- ════ LEFT COLUMN ════ -->
        <div class="main-col">

          <!-- Assigned members badges -->
          @if (assignedMembers().length > 0) {
            <div class="assigned-row">
              <span class="meta-label">Assigné à</span>
              <div class="assigned-badges">
                @for (name of assignedMembers(); track name) {
                  <div class="member-badge">
                    <div class="avatar sm" [style.background]="memberData(name)?.color">
                      {{ memberData(name)?.initials }}
                    </div>
                    <span>{{ name }}</span>
                    <button mat-icon-button class="unassign-btn" (click)="removeMember(name)" matTooltip="Retirer">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Description -->
          <section class="section">
            <div class="section-header">
              <mat-icon class="sh-icon">notes</mat-icon>
              <span class="section-title">Description</span>
            </div>
            <textarea
              class="desc-area"
              formControlName="description"
              placeholder="Ajouter une description plus détaillée…"
              rows="4"
            ></textarea>
          </section>

          <!-- Checklist -->
          @if (checklistItems().length > 0) {
            <section class="section">
              <div class="section-header">
                <mat-icon class="sh-icon">checklist</mat-icon>
                <span class="section-title">Checklist</span>
                <span class="progress-pct">{{ checklistProgress() }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill"
                     [style.width.%]="checklistProgress()"
                     [class.progress-done]="checklistProgress() === 100"></div>
              </div>
              <div class="checklist-list">
                @for (item of checklistItems(); track $index) {
                  <div class="checklist-item">
                    <mat-checkbox
                      [checked]="item.done"
                      (change)="toggleItem($index)"
                      color="primary">
                    </mat-checkbox>
                    <span class="item-label" [class.done]="item.done">{{ item.label }}</span>
                    <button mat-icon-button class="remove-btn" (click)="removeItem($index)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <div class="add-item-row">
                <input
                  class="add-item-input"
                  [(ngModel)]="newItemText"
                  [ngModelOptions]="{standalone: true}"
                  placeholder="Ajouter un élément…"
                  (keyup.enter)="addItem()"
                />
                <button class="add-item-btn" (click)="addItem()">Ajouter</button>
              </div>
            </section>
          }

          <!-- Activity -->
          <section class="section">
            <div class="section-header">
              <mat-icon class="sh-icon">forum</mat-icon>
              <span class="section-title">Activité</span>
            </div>
            <div class="activity-feed">
              @if (activities().length === 0) {
                <p class="activity-empty">Aucune activité pour le moment.</p>
              }
              @for (a of activities(); track a.id) {
                <div class="activity-item">
                  <div class="avatar sm" [style.background]="avatarColor(a.authorName)">{{ a.authorInitials }}</div>
                  <div class="activity-body">
                    <span class="activity-user">{{ a.authorName }}</span>
                    <span class="activity-text">{{ activityText(a) }}</span>
                    <span class="activity-time">{{ timeAgo(a.createdAt) }}</span>
                  </div>
                </div>
              }
            </div>
            @if (isEdit) {
              <div class="add-comment-row">
                <div class="avatar sm accent-bg">Moi</div>
                <input
                  class="comment-input"
                  [value]="commentText()"
                  (input)="commentText.set($any($event.target).value)"
                  placeholder="Écrire un commentaire…"
                  (keyup.enter)="submitComment()"
                />
                <button class="send-btn" (click)="submitComment()" [disabled]="!commentText().trim()">
                  <mat-icon>send</mat-icon>
                </button>
              </div>
            }
          </section>

        </div>

        <!-- ════ RIGHT SIDEBAR ════ -->
        <div class="sidebar-col">

          <!-- Members -->
          <div class="sb-group">
            <p class="sb-label">Membres</p>
            <button class="sb-btn" (click)="togglePicker()">
              <mat-icon>person_add</mat-icon>
              Assigner
            </button>
            @if (showPicker()) {
              <div class="member-picker">
                @for (m of members(); track m.name) {
                  <button class="picker-option" (click)="toggleMember(m)">
                    <div class="avatar sm" [style.background]="m.color">{{ m.initials }}</div>
                    <span>{{ m.name }}</span>
                    @if (assignedMembers().includes(m.name)) {
                      <mat-icon class="check-icon">check</mat-icon>
                    }
                  </button>
                }

                <div class="picker-divider"></div>

                <div class="invite-section">
                  <div class="invite-row">
                    <input
                      #inviteInput
                      type="email"
                      class="invite-input"
                      placeholder="Inviter par email…"
                      (keyup.enter)="sendInvite(inviteInput.value); inviteInput.value = ''"
                    />
                    <button class="invite-btn" (click)="sendInvite(inviteInput.value); inviteInput.value = ''">
                      <mat-icon>send</mat-icon>
                    </button>
                  </div>
                  @if (inviteFeedback()) {
                    <span class="invite-feedback" [class.invite-error]="inviteFeedback()!.type === 'error'">
                      {{ inviteFeedback()!.message }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Status -->
          <div class="sb-group">
            <p class="sb-label">Statut</p>
            <mat-select formControlName="status" class="sb-select">
              @for (s of statuses; track s.value) {
                <mat-option [value]="s.value">{{ s.label }}</mat-option>
              }
            </mat-select>
          </div>

          <!-- Priority -->
          <div class="sb-group">
            <p class="sb-label">Priorité</p>
            <mat-select formControlName="priority" class="sb-select">
              @for (p of priorities; track p.value) {
                <mat-option [value]="p.value">{{ p.label }}</mat-option>
              }
            </mat-select>
          </div>

          <!-- Due date -->
          <div class="sb-group">
            <p class="sb-label">Échéance</p>
            <input
              type="date"
              class="date-input"
              formControlName="dueDate"
            />
          </div>

          <!-- Ajouter -->
          <div class="sb-group">
            <p class="sb-label">Ajouter</p>
            <button class="sb-btn" (click)="toggleChecklist()">
              <mat-icon>checklist</mat-icon>
              Checklist
            </button>
            @if (showChecklist()) {
              <div class="quick-add">
                <input
                  class="quick-input"
                  [(ngModel)]="newItemText"
                  [ngModelOptions]="{standalone: true}"
                  placeholder="Premier élément…"
                  (keyup.enter)="addItem()"
                />
                <button class="quick-confirm" (click)="addItem()">+</button>
              </div>
            }

          </div>

          <!-- Actions -->
          <div class="sb-group">
            <p class="sb-label">Actions</p>
            <button class="sb-btn danger" (click)="cancel()">
              <mat-icon>delete_outline</mat-icon>
              Supprimer
            </button>
          </div>

        </div>
      </div>

      <!-- ── Footer ── -->
      <div class="dlg-footer">
        <button mat-button class="cancel-btn" (click)="cancel()">Annuler</button>
        <button mat-raised-button class="save-btn" [disabled]="form.invalid" (click)="save()">
          <mat-icon>save</mat-icon>
          Sauvegarder
        </button>
      </div>

    </div>
  `,
  styles: [`
    /* ════════════════════════════════════════
       Root container
    ════════════════════════════════════════ */
    .dlg-root {
      background: #1e293b;
      color: #f1f5f9;
      font-family: 'Inter', -apple-system, sans-serif;
      min-width: 620px;
      max-width: 760px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Header ── */
    .dlg-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .header-icon {
      width: 34px; height: 34px; flex-shrink: 0;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 17px; width: 17px; height: 17px; color: #fff; }
    }

    .title-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 1.05rem;
      font-weight: 600;
      color: #f8fafc;
      caret-color: #6366f1;
      &::placeholder { color: #475569; }
    }

    .close-btn {
      color: #475569 !important;
      &:hover { color: #94a3b8 !important; }
    }

    .title-error {
      font-size: 0.75rem;
      color: #f87171;
      margin: 0 20px 4px;
      padding: 0;
    }

    /* ── Body ── */
    .dlg-body {
      display: flex;
      gap: 0;
      overflow-y: auto;
      max-height: 70vh;
    }

    /* ════ LEFT COLUMN ════ */
    .main-col {
      flex: 1;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 0;
    }

    /* Assigned row */
    .assigned-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .assigned-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .meta-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }

    .member-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 3px 10px 3px 4px;
      font-size: 0.8rem;
      color: #cbd5e1;
    }

    .unassign-btn {
      width: 18px !important; height: 18px !important;
      color: #475569 !important;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }

    /* Section */
    .section { display: flex; flex-direction: column; gap: 10px; }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sh-icon {
      font-size: 17px; width: 17px; height: 17px;
      color: #64748b;
    }

    .section-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      flex: 1;
    }

    .progress-pct {
      font-size: 0.72rem;
      color: #64748b;
    }

    /* Description textarea */
    .desc-area {
      width: 100%;
      box-sizing: border-box;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      padding: 12px 14px;
      color: #e2e8f0;
      font-size: 0.875rem;
      font-family: inherit;
      resize: vertical;
      outline: none;
      transition: border-color 0.18s;
      &::placeholder { color: #475569; }
      &:focus { border-color: rgba(99,102,241,0.6); }
    }

    /* Progress bar */
    .progress-track {
      height: 4px;
      background: rgba(255,255,255,0.08);
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #6366f1;
      border-radius: 10px;
      transition: width 0.3s ease, background 0.3s;
    }

    .progress-fill.progress-done { background: #2ecc71; }

    /* Checklist items */
    .checklist-list { display: flex; flex-direction: column; gap: 2px; }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 7px;
      transition: background 0.15s;
      &:hover { background: rgba(255,255,255,0.04); }
    }

    .item-label {
      flex: 1;
      font-size: 0.875rem;
      color: #cbd5e1;
      &.done { text-decoration: line-through; color: #475569; }
    }

    .remove-btn {
      width: 22px !important; height: 22px !important;
      opacity: 0;
      color: #475569 !important;
      transition: opacity 0.15s;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .checklist-item:hover .remove-btn { opacity: 1; }

    /* Add item row */
    .add-item-row {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .add-item-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 7px 12px;
      color: #e2e8f0;
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      &::placeholder { color: #475569; }
      &:focus { border-color: rgba(99,102,241,0.5); }
    }

    .add-item-btn {
      background: rgba(99,102,241,0.2);
      border: 1px solid rgba(99,102,241,0.35);
      border-radius: 8px;
      padding: 6px 14px;
      color: #818cf8;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      &:hover { background: rgba(99,102,241,0.35); }
    }

    /* Activity */
    .activity-feed { display: flex; flex-direction: column; gap: 12px; }

    .activity-item { display: flex; gap: 10px; align-items: flex-start; }

    .activity-body {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .activity-empty { font-size: 0.78rem; color: #334155; font-style: italic; margin: 0; }
    .activity-user { font-size: 0.78rem; font-weight: 600; color: #94a3b8; }
    .activity-text { font-size: 0.82rem; color: #64748b; }
    .activity-time { font-size: 0.68rem; color: #334155; }

    .add-comment-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 4px;
    }

    .send-btn {
      width: 30px; height: 30px; flex-shrink: 0;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 50%;
      color: #818cf8;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover:not(:disabled) { background: rgba(99,102,241,0.3); }
      &:disabled { opacity: 0.35; cursor: default; }
    }

    .comment-input {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 20px;
      padding: 8px 16px;
      color: #e2e8f0;
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      &::placeholder { color: #475569; }
      &:focus { border-color: rgba(99,102,241,0.4); }
    }

    /* ════ AVATARS ════ */
    .avatar {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: #fff;
      flex-shrink: 0; text-transform: uppercase;
    }

    .avatar.sm { width: 26px; height: 26px; font-size: 0.65rem; border-radius: 50%; }
    .avatar.accent-bg { background: linear-gradient(135deg, #6366f1, #3b82f6); font-size: 0.55rem; }

    /* ════ RIGHT SIDEBAR ════ */
    .sidebar-col {
      width: 176px;
      min-width: 176px;
      border-left: 1px solid rgba(255,255,255,0.07);
      background: #172033;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .sb-group { display: flex; flex-direction: column; gap: 6px; }

    .sb-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: #475569;
      margin: 0;
    }

    .sb-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      width: 100%;
      padding: 7px 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; flex-shrink: 0; }
      &:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
    }

    .sb-btn.danger {
      color: #f87171;
      &:hover { background: rgba(248,113,113,0.12); }
    }

    /* Member picker */
    .member-picker {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      overflow: hidden;
    }

    .picker-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 10px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.8rem;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      &:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    }

    .check-icon {
      margin-left: auto;
      font-size: 14px; width: 14px; height: 14px;
      color: #6366f1;
    }

    /* Invite section */
    .picker-divider {
      height: 1px;
      background: rgba(255,255,255,0.07);
      margin: 4px 0;
    }

    .invite-section {
      padding: 4px 6px 6px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .invite-row {
      display: flex;
      gap: 4px;
    }

    .invite-input {
      flex: 1;
      min-width: 0;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 5px 8px;
      color: #e2e8f0;
      font-size: 0.75rem;
      font-family: inherit;
      outline: none;
      &::placeholder { color: #475569; }
      &:focus { border-color: rgba(99,102,241,0.5); }
    }

    .invite-btn {
      width: 28px; height: 28px; flex-shrink: 0;
      background: rgba(99,102,241,0.2);
      border: none;
      border-radius: 6px;
      color: #818cf8;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: rgba(99,102,241,0.4); }
    }

    .invite-feedback {
      font-size: 0.7rem;
      color: #10b981;
      padding-left: 2px;
    }

    .invite-feedback.invite-error { color: #f87171; }

    /* Sidebar selects */
    .sb-select {
      width: 100%;
      font-size: 0.8rem;
    }

    :host ::ng-deep .sb-select .mat-mdc-select-trigger {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 8px;
      padding: 6px 10px;
      color: #cbd5e1;
    }

    :host ::ng-deep .sb-select .mat-mdc-select-arrow { color: #475569; }

    /* Quick checklist input */
    .quick-add {
      display: flex;
      gap: 4px;
    }

    .quick-input {
      flex: 1;
      min-width: 0;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 5px 8px;
      color: #e2e8f0;
      font-size: 0.75rem;
      font-family: inherit;
      outline: none;
      &::placeholder { color: #475569; }
    }

    /* ── Date input ── */
    .date-input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 8px;
      padding: 7px 10px;
      color: #e2e8f0;
      font-size: 0.8rem;
      font-family: inherit;
      outline: none;
      cursor: pointer;
      color-scheme: dark;
      &:focus { border-color: rgba(99,102,241,0.5); }
    }

    .quick-confirm {
      background: rgba(99,102,241,0.25);
      border: none;
      border-radius: 6px;
      width: 28px;
      color: #818cf8;
      font-size: 1rem;
      cursor: pointer;
      &:hover { background: rgba(99,102,241,0.4); }
    }

    /* ── Footer ── */
    .dlg-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .cancel-btn {
      color: #64748b !important;
      font-size: 0.875rem !important;
      &:hover { color: #94a3b8 !important; }
    }

    .save-btn {
      height: 40px;
      padding: 0 22px !important;
      border-radius: 9px !important;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%) !important;
      color: #fff !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
    }

    /* ── Scrollbar ── */
    .dlg-body::-webkit-scrollbar { width: 4px; }
    .dlg-body::-webkit-scrollbar-track { background: transparent; }
    .dlg-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .dlg-root { min-width: 100vw; }
      .dlg-body { flex-direction: column; }
      .sidebar-col { width: 100%; border-left: none; border-top: 1px solid rgba(255,255,255,0.07); }
    }
  `],
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService     = inject(TaskService);
  private readonly projectService  = inject(ProjectService);
  private readonly invitationService = inject(InvitationService);
  readonly dialogRef = inject(MatDialogRef<TaskFormComponent>);
  readonly data: TaskDialogData = inject(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data?.task;

  /* ── Signals ── */
  assignedMembers = signal<string[]>(this.data?.task?.assignedMembers ?? []);
  showPicker      = signal(false);
  showChecklist  = signal(false);
  checklistItems = signal<ChecklistItem[]>([]);
  activities     = signal<Activity[]>([]);
  commentText    = signal('');
  newItemText    = '';
  inviteFeedback = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  /* ── Computed ── */
  checklistProgress = computed(() => {
    const items = this.checklistItems();
    if (!items.length) return 0;
    return Math.round((items.filter(i => i.done).length / items.length) * 100);
  });

  memberData = (name: string) => this.members().find(m => m.name === name) ?? null;

  /* ── Members (chargés depuis l'API) ── */
  members = signal<Member[]>([]);

  private readonly AVATAR_COLORS = [
    '#6366f1', '#0ea5e9', '#a855f7', '#f59e0b',
    '#10b981', '#ef4444', '#ec4899', '#14b8a6',
  ];

  readonly statuses: { value: TaskStatus; label: string }[] = [
    { value: 'TODO',        label: 'À faire'  },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'DONE',        label: 'Terminée' },
  ];

  readonly priorities: { value: Priority; label: string }[] = [
    { value: 'LOW',    label: 'Basse'   },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH',   label: 'Haute'   },
  ];

  form = this.fb.group({
    title:       [this.data?.task?.title ?? '',       [Validators.required, Validators.maxLength(100)]],
    description: [this.data?.task?.description ?? '', []],
    status:      [this.data?.task?.status ?? ('TODO' as TaskStatus), [Validators.required]],
    priority:    [this.data?.task?.priority ?? ('LOW' as Priority),  [Validators.required]],
    dueDate:     [this.data?.task?.dueDate ?? null,   []],
  });

  ngOnInit(): void {
    const pid = this.data.projectId ?? this.data.task?.projectId;
    const loadMembers = (projectMembers: { userId: number; username: string }[]) => {
      this.members.set(projectMembers.map(m => ({
        name: m.username,
        initials: m.username.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        color: this.AVATAR_COLORS[m.userId % this.AVATAR_COLORS.length],
      })));
    };
    const existing = this.projectService.selected()?.members;
    if (existing?.length) {
      loadMembers(existing);
    } else if (pid) {
      this.projectService.getProject(pid).subscribe(p => loadMembers(p.members ?? []));
    }
    if (this.isEdit && this.data.task?.id) {
      const pid = this.data.projectId ?? this.data.task?.projectId;
      if (pid) this.taskService.getActivities(pid, this.data.task.id).subscribe(list => this.activities.set(list));
    }
  }

  /* ── Activity helpers ── */
  avatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.AVATAR_COLORS[Math.abs(hash) % this.AVATAR_COLORS.length];
  }

  activityText(a: Activity): string {
    switch (a.type) {
      case 'TASK_CREATED': return 'a créé cette tâche';
      case 'TASK_UPDATED': return 'a modifié la tâche';
      case 'COMMENT_ADDED': return a.detail ?? '';
    }
  }

  timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  }

  submitComment(): void {
    const text = this.commentText().trim();
    if (!text || !this.data.task?.id) return;
    const pid = this.data.projectId ?? this.data.task?.projectId;
    if (!pid) return;
    this.taskService.addComment(pid, this.data.task.id, text).subscribe({
      next: (activity) => {
        this.activities.update(list => [...list, activity]);
        this.commentText.set('');
      },
      error: (err) => console.error('Erreur ajout commentaire', err),
    });
  }

  /* ── Invite ── */
  sendInvite(email: string): void {
    email = email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.inviteFeedback.set({ message: 'Email invalide.', type: 'error' });
      setTimeout(() => this.inviteFeedback.set(null), 3000);
      return;
    }
    const taskId = this.data?.task?.id;
    this.invitationService.invite(email, taskId).subscribe({
      next: (res) => {
        const msg = res.status === 'already_registered'
          ? 'Utilisateur déjà inscrit.'
          : `Invitation envoyée à ${email}`;
        this.inviteFeedback.set({ message: msg, type: 'success' });
        setTimeout(() => this.inviteFeedback.set(null), 3000);
      },
      error: () => {
        this.inviteFeedback.set({ message: 'Erreur lors de l\'invitation.', type: 'error' });
        setTimeout(() => this.inviteFeedback.set(null), 3000);
      },
    });
  }

  /* ── Toggle helpers ── */
  togglePicker(): void   { this.showPicker.update(v => !v); }
  toggleChecklist(): void { this.showChecklist.update(v => !v); }

  /* ── Checklist actions ── */
  addItem(): void {
    const text = this.newItemText.trim();
    if (!text) return;
    this.checklistItems.update(items => [...items, { label: text, done: false }]);
    this.newItemText = '';
    this.showChecklist.set(false);
  }

  toggleItem(index: number): void {
    this.checklistItems.update(items =>
      items.map((item, i) => i === index ? { ...item, done: !item.done } : item)
    );
  }

  removeItem(index: number): void {
    this.checklistItems.update(items => items.filter((_, i) => i !== index));
  }

  /* ── Member actions ── */
  toggleMember(m: Member): void {
    this.assignedMembers.update(list =>
      list.includes(m.name) ? list.filter(n => n !== m.name) : [...list, m.name]
    );
  }

  removeMember(name: string): void {
    this.assignedMembers.update(list => list.filter(n => n !== name));
  }

  /* ── Dialog actions ── */
  cancel(): void { this.dialogRef.close(); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { title, description, status, priority, dueDate } = this.form.getRawValue();
    this.dialogRef.close({
      title:          title!,
      description:    description ?? undefined,
      status:         status as TaskStatus,
      priority:       priority as Priority,
      dueDate:        dueDate ?? undefined,
      assignedMembers: this.assignedMembers(),
    } satisfies TaskRequest);
  }
}
